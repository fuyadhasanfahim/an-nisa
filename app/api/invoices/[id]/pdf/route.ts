import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/db/prisma";
import type { InvoicePdfModel } from "@/lib/pdf/InvoiceDocument";
import { generateInvoicePdfBuffer } from "@/lib/pdf/generateInvoicePdf";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminSession(request);
  if (isNextResponse(authResult)) return authResult;

  const { id } = await params;

  const invoiceRow = await prisma.invoice.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              product: { select: { name: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!invoiceRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ord = invoiceRow.order;
  const model: InvoicePdfModel = {
    number: invoiceRow.number,
    issuedAtIso: invoiceRow.issuedAt.toISOString(),
    customer: {
      name: ord.user.name,
      email: ord.user.email,
    },
    currency: invoiceRow.currency,
    items: ord.items.map((it) => ({
      name: it.product.name,
      quantity: it.quantity,
      unitCents: it.unitCents,
    })),
    subtotalCents: ord.subtotalCents,
    discountCents: ord.discountCents,
    shippingFeeCents: ord.shippingFeeCents,
    totalCents: invoiceRow.totalCents,
  };

  const buf = await generateInvoicePdfBuffer(model);
  const safeName = `${invoiceRow.number.replace(/[^\w.-]+/g, "_")}.pdf`;

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
