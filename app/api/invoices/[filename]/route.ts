import { NextRequest, NextResponse } from "next/server";
import { generateInvoicePdfBuffer } from "@/lib/pdf/generateInvoicePdf";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  const buf = await generateInvoicePdfBuffer({
    number: "INV-0001",
    issuedAtIso: new Date().toISOString(),
    customer: { name: "Sample Customer", email: "customer@example.com" },
    currency: "BDT",
    items: [
      { name: "Embroidery — Floral Motif", quantity: 1, unitCents: 450000 },
      { name: "Premium Thread Upgrade", quantity: 1, unitCents: 50000 },
    ],
  });

  const safeName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}

