import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/get-session";
import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validators/checkout.schema";
import { z } from "zod";
import {
  aggregateQtyByProductId,
  decrementStockForQuantities,
  InsufficientStockError,
  orderCountsAgainstStock,
} from "@/lib/inventory/order-stock";
import { finalizeOrderTotals } from "@/lib/orders/compute-order-totals";
import { serializeOrderDetail } from "@/lib/orders/serialize-order";
import {
  allocateUniqueOrderId,
  ensureCustomerPublicId,
} from "@/lib/ids/public-ref";
import { sendOrderEmails } from "@/lib/mail/nodemailer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Sign in to place an order" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }
  if (me.banned) {
    return NextResponse.json(
      { error: "Your account cannot place orders. Contact support." },
      { status: 403 }
    );
  }

  try {
    const json = await req.json();
    const input = checkoutSchema.parse(json);

    const qtyByProduct = new Map<string, number>();
    for (const l of input.items) {
      qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);
    }
    const productIds = [...qtyByProduct.keys()];

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products are unavailable" },
        { status: 400 }
      );
    }

    const lines = productIds.map((productId) => {
      const p = products.find((x) => x.id === productId)!;
      const qty = qtyByProduct.get(productId)!;
      const unitCents = p.discountPriceCents ?? p.priceCents;
      return { productId, quantity: qty, unitCents };
    });

    const totals = finalizeOrderTotals({
      lines,
      discountCents: Math.round(input.discount * 100),
      shippingFeeCents: Math.round(input.shippingFee * 100),
    });

    const paymentId = (input.paymentId ?? "").trim() || "COD";

    const created = await prisma.$transaction(async (tx) => {
      await ensureCustomerPublicId(tx, session.user.id);
      const orderId = await allocateUniqueOrderId(tx);

      const order = await tx.order.create({
        data: {
          id: orderId,
          userId: session.user.id,
          status: "pending",
          subtotalCents: totals.subtotalCents,
          discountCents: totals.discountCents,
          shippingFeeCents: totals.shippingFeeCents,
          totalCents: totals.totalCents,
          currency: "BDT",
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
          paymentId,
          paymentCollectedVia: input.paymentCollectedVia,
          shippingPhone: input.shippingPhone?.trim() || null,
          shippingAddress: input.shippingAddress.trim(),
          shippingCity: input.shippingCity.trim(),
          shippingCountry: input.shippingCountry.trim().toUpperCase(),
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              unitCents: l.unitCents,
            })),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              customers: { select: { publicCustomerId: true } },
            },
          },
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });

      if (orderCountsAgainstStock(order.status)) {
        await decrementStockForQuantities(tx, aggregateQtyByProductId(lines));
      }

      return order;
    });

    // Dispatch emails asynchronously in the background so it doesn't block the checkout response
    sendOrderEmails(created).catch((err) => {
      console.error("[checkout] Error sending background order emails:", err);
    });

    return NextResponse.json(serializeOrderDetail(created), { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    if (err instanceof InsufficientStockError) {
      return NextResponse.json(
        {
          error:
            "Not enough stock for one or more products. Reduce quantities or try again later.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
