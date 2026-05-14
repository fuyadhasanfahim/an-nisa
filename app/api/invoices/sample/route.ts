import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { generateInvoicePdfBuffer } from "@/lib/pdf/generateInvoicePdf";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

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

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sample-invoice.pdf"`,
    },
  });
}
