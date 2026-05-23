import { sendContactEnquiryEmail } from "@/lib/mail/nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { name, email, subject, message } = json;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sent = await sendContactEnquiryEmail({ name, email, subject, message });

    if (sent) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Failed to send email. Check SMTP logs." }, { status: 500 });
    }
  } catch (error) {
    console.error("[api/contact] Error processing enquiry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
