import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { normalizeOrderListQuery } from "@/lib/validators/order-list.query";
import { orderWriteSchema } from "@/lib/validators/order.schema";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  aggregateQtyByProductId,
  decrementStockForQuantities,
  InsufficientStockError,
  orderCountsAgainstStock,
} from "@/lib/inventory/order-stock";
import { finalizeOrderTotals } from "@/lib/orders/compute-order-totals";
import { serializeOrderDetail } from "@/lib/orders/serialize-order";

export const runtime = "nodejs";

function serializeOrderListItem(
  o: Prisma.OrderGetPayload<{
    include: {
      user: { select: { id: true; name: true; email: true } };
      _count: { select: { items: true } };
    };
  }>
) {
  return {
    id: o.id,
    userId: o.userId,
    status: o.status,
    totalCents: o.totalCents,
    currency: o.currency,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    user: o.user,
    itemCount: o._count.items,
  };
}

export async function GET(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const q = normalizeOrderListQuery({
      q: searchParams.get("q") ?? "",
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const where: Prisma.OrderWhereInput =
      q.q.length > 0
        ? {
            OR: [
              { id: { contains: q.q } },
              { status: { contains: q.q, mode: "insensitive" } },
              {
                user: {
                  OR: [
                    { email: { contains: q.q, mode: "insensitive" } },
                    { name: { contains: q.q, mode: "insensitive" } },
                  ],
                },
              },
            ],
          }
        : {};

    const orderBy = {
      [q.sort]: q.order,
    } as Prisma.OrderOrderByWithRelationInput;

    const total = await prisma.order.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / q.limit));
    const page = Math.min(Math.max(1, q.page), totalPages);
    const skip = (page - 1) * q.limit;

    const orders = await prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: q.limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({
      items: orders.map(serializeOrderListItem),
      total,
      page,
      limit: q.limit,
      totalPages,
      sort: q.sort,
      order: q.order,
      q: q.q,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to list orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const json = await req.json();
    const input = orderWriteSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { id: input.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const productIds = [...new Set(input.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products were not found" },
        { status: 400 }
      );
    }

    const priceById = new Map(products.map((p) => [p.id, p.priceCents]));

    const lines = input.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      unitCents: priceById.get(i.productId)!,
    }));

    const totals = finalizeOrderTotals({
      lines,
      discountCents: input.discountCents,
      shippingFeeCents: input.shippingFeeCents,
    });

    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: input.userId,
          status: input.status,
          subtotalCents: totals.subtotalCents,
          discountCents: totals.discountCents,
          shippingFeeCents: totals.shippingFeeCents,
          totalCents: totals.totalCents,
          currency: "BDT",
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentStatus,
          shippingPhone: input.shippingPhone ?? null,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingCountry: input.shippingCountry,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              unitCents: l.unitCents,
            })),
          },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });

      if (orderCountsAgainstStock(input.status)) {
        await decrementStockForQuantities(
          tx,
          aggregateQtyByProductId(lines)
        );
      }

      return order;
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
            "Not enough stock for one or more products. Reduce quantities or update inventory.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
