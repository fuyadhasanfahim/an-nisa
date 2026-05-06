import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import {
  orderPatchSchema,
  orderWriteSchema,
} from "@/lib/validators/order.schema";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  aggregateQtyByProductId,
  decrementStockForQuantities,
  incrementStockForQuantities,
  InsufficientStockError,
  OrderNotFoundError,
  orderCountsAgainstStock,
} from "@/lib/inventory/order-stock";

export const runtime = "nodejs";

function serializeOrderDetail(
  o: Prisma.OrderGetPayload<{
    include: {
      user: { select: { id: true; name: true; email: true } };
      items: {
        include: {
          product: { select: { id: true; name: true; slug: true } };
        };
      };
    };
  }>
) {
  return {
    id: o.id,
    userId: o.userId,
    status: o.status,
    totalCents: o.totalCents,
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    user: o.user,
    items: o.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      quantity: it.quantity,
      unitCents: it.unitCents,
      createdAt: it.createdAt.toISOString(),
      product: it.product,
    })),
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serializeOrderDetail(order));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const { id } = await params;

  try {
    const json = await req.json();
    const input = orderWriteSchema.parse(json);

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
    const totalCents = lines.reduce(
      (sum, l) => sum + l.unitCents * l.quantity,
      0
    );

    const updated = await prisma.$transaction(async (tx) => {
      if (orderCountsAgainstStock(existing.status)) {
        await incrementStockForQuantities(
          tx,
          aggregateQtyByProductId(existing.items)
        );
      }

      await tx.orderItem.deleteMany({ where: { orderId: id } });
      const order = await tx.order.update({
        where: { id },
        data: {
          userId: input.userId,
          status: input.status,
          totalCents,
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
        await decrementStockForQuantities(tx, aggregateQtyByProductId(lines));
      }

      return order;
    });

    return NextResponse.json(serializeOrderDetail(updated));
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
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const { id } = await params;

  try {
    const json = await req.json();
    const body = orderPatchSchema.parse(json);

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!current) {
        throw new OrderNotFoundError();
      }

      const from = current.status;
      const to = body.status;

      if (
        orderCountsAgainstStock(from) &&
        !orderCountsAgainstStock(to)
      ) {
        await incrementStockForQuantities(
          tx,
          aggregateQtyByProductId(current.items)
        );
      } else if (
        !orderCountsAgainstStock(from) &&
        orderCountsAgainstStock(to)
      ) {
        await decrementStockForQuantities(
          tx,
          aggregateQtyByProductId(current.items)
        );
      }

      return tx.order.update({
        where: { id },
        data: { status: to },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });
    });

    return NextResponse.json(serializeOrderDetail(updated));
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
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) {
        throw new OrderNotFoundError();
      }
      if (orderCountsAgainstStock(existing.status)) {
        await incrementStockForQuantities(
          tx,
          aggregateQtyByProductId(existing.items)
        );
      }
      await tx.order.delete({ where: { id } });
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
