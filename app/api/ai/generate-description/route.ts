import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, fabricType, embroideryType, colors, sizes, tags } = body;

    const apiKey = process.env.GEMINI_API_KEY!;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Please add GEMINI_API_KEY to your .env file." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
      You are an expert copywriter for a premium women's boutique, specializing in abayas, modest wear, and embroidered fashion. 
      Write a professional, elegant, and SEO-friendly product description in English based on the following details:
      
      Name: ${name || "N/A"}
      Category: ${category || "N/A"}
      Fabric Type: ${fabricType || "N/A"}
      Embroidery Type: ${embroideryType || "N/A"}
      Colors: ${colors?.map((c: { name?: string; raw?: string } | string) => typeof c === 'string' ? c : c.name || c.raw).join(", ") || "N/A"}
      Sizes: ${sizes?.join(", ") || "N/A"}
      Tags: ${tags?.join(", ") || "N/A"}

      The description should be structured nicely, highlighting the fabric, design, and when/how to wear it. Keep it under 150 words. Do not include markdown formatting or bullet points if possible, just well-structured paragraphs.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ description: text.trim() });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
