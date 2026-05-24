import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

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

        const systemPrompt = `
You are An-Nisa's Helpful Shopping Assistant. Your goal is to help customers find products and answer their questions politely, briefly, and helpfully.
About An-Nisa:
- A premium boutique specializing in Modest Wear, Abayas, Embroidery, Handmade fashion, and custom pieces.
- Categories: Abaya, Embroidery, Fashion, Textiles, Handmade, Custom, Accessories.
- Payment Methods Supported: Cash on Delivery (COD), bKash, Nagad.

Important Rules:
- Keep your answers concise and elegant.
- Always respond in the same language the user writes in (Bangla or English).
- Do not make up non-existent products or prices. If you don't know, gently redirect them to browse our catalog or ask a human agent.
- If the user explicitly asks for a human, a real person, or WhatsApp, simply acknowledge it and say they will be connected shortly.
`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
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

        return NextResponse.json({
            reply: text,
            wantsHuman: wantsHumanFromInput,
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
