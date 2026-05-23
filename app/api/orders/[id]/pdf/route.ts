import { getSessionFromRequest } from "@/lib/auth/get-session";
import { prisma } from "@/lib/db/prisma";
import type { InvoicePdfModel } from "@/lib/pdf/InvoiceDocument";
import { generateInvoicePdfBuffer } from "@/lib/pdf/generateInvoicePdf";
import { allocateUniqueInvoiceNumber } from "@/lib/ids/public-ref";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      invoice: true,
      items: {
        include: {
          product: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isOwner = order.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let invoiceRow = order.invoice;

  // If invoice does not exist, only Admin can auto-create it
  if (!invoiceRow) {
    if (!isAdmin) {
      return NextResponse.json({ error: "Invoice not generated yet" }, { status: 400 });
    }

    // Auto-create invoice for admin
    invoiceRow = await prisma.$transaction(async (tx) => {
      const number = await allocateUniqueInvoiceNumber(tx);
      return tx.invoice.create({
        data: {
          orderId: order.id,
          userId: order.userId,
          number,
          totalCents: order.totalCents,
          currency: order.currency,
        },
      });
    });
  }

  const model: InvoicePdfModel = {
    number: invoiceRow.number,
    issuedAtIso: invoiceRow.issuedAt.toISOString(),
    customer: {
      name: order.user.name,
      email: order.user.email,
    },
    currency: invoiceRow.currency,
    items: order.items.map((it) => ({
      name: it.product.name,
      quantity: it.quantity,
      unitCents: it.unitCents,
    })),
    subtotalCents: order.subtotalCents,
    discountCents: order.discountCents,
    shippingFeeCents: order.shippingFeeCents,
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
