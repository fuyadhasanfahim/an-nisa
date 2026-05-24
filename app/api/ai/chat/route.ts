import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/db/prisma";

// Matched against the user's own message (intent to escalate)
const HUMAN_KEYWORDS = [
    // English
    'human',
    'real person',
    'agent',
    'directly',
    'direct',
    'talk to someone',
    'speak to someone',
    'contact you',
    'call you',
    'phone you',
    'manually',
    'staff',
    'support',
    'representative',
    'operator',
    'team member',
    'connect me',
    'real agent',
    'customer service',
    'support team',
    'live chat',
    'live agent',
    'whatsapp',

    // Banglish
    'manush er sathe',
    'real manush',
    'whatsapp e dao',
    'whatsapp daw',
    'whatsapp den',
    'direct kotha',
    'apnader sathe',
    'actual manush',
    'kotha bolbo',
    'direct bolbo',
    'agent dao',
    'support dao',
    'number dao',
    'phone number',
    'call dibo',
    'real support',
    'human support',
    'team er sathe',
    'customer care',

    // Bangla
    'মানুষের সাথে',
    'কারো সাথে কথা বলতে চাই',
    'মানুষ',
    'সরাসরি',
    'হোয়াটসঅ্যাপ',
    'সাপোর্ট',
    'এজেন্ট',
    'প্রতিনিধি',
    'ফোন করব',
    'কল করব',
    'নম্বর দিন',
    'সরাসরি কথা বলব',
    'আপনাদের সাথে কথা বলব',
    'রিয়েল মানুষ',
    'আসল মানুষ',
    'কর্মী',
    'স্টাফ',
    'ম্যানুয়ালি',
    'দলের সদস্য',
    'কাস্টমার সার্ভিস',
    'সাপোর্ট টিম',
    'কাস্টমার কেয়ার',
];

// Matched against the AI's own reply — catches cases where the AI itself
// recognised escalation but the user's phrasing missed the keyword list.
const HUMAN_REPLY_SIGNALS = [
    'team member',
    'will reply',
    'will get back',
    'connect you',
    'our team will',
    'someone will',
    'shortly',
    'reach out',
    'whatsapp',
    'customer service',
    'support team',
    'real person',
    'human agent',
    'live agent',
    'হোয়াটসঅ্যাপ',
    'টিম মেম্বার',
    'দলের সদস্য',
    'সাপোর্ট টিম',
    'সংযুক্ত করব',
    'যোগাযোগ করবে',
];

export async function POST(req: Request) {
    try {
        const { messages, userMessage } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY!;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API Key missing', wantsHuman: true },
                { status: 500 },
            );
        }

        const lowerMessage = userMessage.toLowerCase();
        const wantsHumanFromInput = HUMAN_KEYWORDS.some((keyword) =>
            lowerMessage.includes(keyword),
        );

        const genAI = new GoogleGenerativeAI(apiKey);

        // Fetch products from Prisma
        let catalogText = "";
        try {
            const products = await prisma.product.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    priceCents: true,
                    discountPriceCents: true,
                    category: true,
                    description: true,
                    colors: true,
                    sizes: true,
                    fabricType: true,
                    tags: true,
                    stockQuantity: true,
                },
                take: 50,
            });

            console.log('Products fetched for AI:', products.length, products.map(p => p.name));

            if (products.length > 0) {
                catalogText = products.map(p => {
                    const price = p.priceCents / 100;
                    const discountPrice = p.discountPriceCents ? p.discountPriceCents / 100 : null;
                    const priceStr = discountPrice ? `৳${discountPrice} (Original: ৳${price})` : `৳${price}`;
                    const colorsStr = p.colors && p.colors.length > 0 ? p.colors.join(', ') : 'N/A';
                    const sizesStr = p.sizes && p.sizes.length > 0 ? p.sizes.join(', ') : 'N/A';
                    const tagsStr = p.tags && p.tags.length > 0 ? p.tags.join(', ') : 'N/A';
                    const descStr = p.description ? p.description.substring(0, 100).replace(/\n/g, ' ') + '...' : 'N/A';

                    return `- Name: ${p.name}\n  Link: /product/${p.slug}\n  Price: ${priceStr}\n  Category: ${p.category}\n  Stock: ${p.stockQuantity}\n  Colors: ${colorsStr}\n  Sizes: ${sizesStr}\n  Fabric: ${p.fabricType || 'N/A'}\n  Tags: ${tagsStr}\n  Description: ${descStr}`;
                }).join('\n\n');
            }
        } catch (dbError) {
            console.error("[AI Chat] Prisma fetch error:", dbError);
        }

        const catalogSection = catalogText
            ? `CURRENT PRODUCT CATALOG:\n${catalogText}`
            : `CURRENT PRODUCT CATALOG:\n(Empty — no active products in the database right now.)`;

        const systemPrompt = `
You are An-Nisa Bot, a premium shopping assistant. Your goal is to help customers find products and answer their questions politely, briefly, and helpfully.
About An-Nisa:
- A premium boutique specializing in Modest Wear, Abayas, Embroidery, Handmade fashion, and custom pieces.
- Categories: Abaya, Embroidery, Fashion, Textiles, Handmade, Custom, Accessories.
- Payment Methods Supported: Cash on Delivery (COD), bKash, Nagad.

You have access to our REAL product catalog below. When a user asks for product recommendations, ALWAYS refer to this catalog and suggest specific products with their exact prices and a clickable link.

${catalogSection}

IMPORTANT: Always format product links as markdown hyperlinks like this:
[পণ্য দেখুন](/product/product-slug)
Never write raw URLs or plain text links like "/product/slug" or "লিংক: /product/slug". Always use proper markdown link syntax so they render as clickable links.

Important Rules:
- ONLY suggest products that are listed in the catalog above. NEVER invent or guess product names, prices, or slugs.
- If the catalog is empty or has no matching products, say exactly: "আমাদের এই মুহূর্তে কোনো পণ্য নেই।" Do not make up products.
- Show price in Taka.
- If discountPriceCents exists, show both original and discounted price.
- Every product recommendation MUST include a markdown link: [পণ্য দেখুন](/product/slug)
- If stock is 0, don't recommend that product.
- Keep your answers concise and elegant.
- Always respond in the same language the user writes in (Bangla or English or Banglish).

CRITICAL RULE: If the user wants to talk to a human, team member, agent, or use WhatsApp, you must NEVER pretend to connect them or say "a team member will reply shortly" or make up fake handoff responses. Instead, reply with exactly one short sentence acknowledging their request, such as: "অবশ্যই, নিচের বাটনে ক্লিক করে আমাদের টিমের সাথে যোগাযোগ করুন।" (or in English: "Sure, please use the button below to contact our team.") — nothing more. Do NOT simulate a handoff.
`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-3.5-flash',
            systemInstruction: systemPrompt,
        });

        // Transform simple {role, content} to Gemini expected format
        const history = messages.map((m: { role: "user" | "model"; content: string }) => ({
            role: m.role,
            parts: [{ text: m.content }],
        }));

        const chat = model.startChat({
            history,
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        // Also check the AI's own reply — if it wrote "team member will reply
        // shortly" the user clearly needs escalation even if their message
        // didn't hit the keyword list.
        const lowerReply = text.toLowerCase();
        const wantsHumanFromReply = HUMAN_REPLY_SIGNALS.some((signal) =>
            lowerReply.includes(signal),
        );

        return NextResponse.json({
            reply: text,
            wantsHuman: wantsHumanFromInput || wantsHumanFromReply,
        });
    } catch (error: unknown) {
        console.error("Gemini Chat API Error:", error instanceof Error ? error.message : error);
        // On error, we fallback to human to ensure customer isn't stuck
        return NextResponse.json(
            {
                reply: "I'm having trouble connecting to my brain right now. You can talk to a real person instead!",
                wantsHuman: true,
            },
            { status: 500 },
        );
    }
}
