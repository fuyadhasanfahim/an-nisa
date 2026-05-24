import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY!;
    if (!apiKey) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // A minimal prompt to just test API key validity and quota
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "ping" }] }],
      generationConfig: { maxOutputTokens: 1 },
    });
    
    const response = await result.response;
    if (response) {
      return NextResponse.json({ ok: true });
    }
    
    return NextResponse.json({ ok: false });
  } catch (error) {
    console.error("Gemini API Ping Error:", error);
    return NextResponse.json({ ok: false });
  }
}
