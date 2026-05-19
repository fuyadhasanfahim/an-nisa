import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/get-session";
import { NextResponse } from "next/server";
import { serializeOrderDetail } from "@/lib/orders/serialize-order";
import { ensureCustomerPublicId } from "@/lib/ids/public-ref";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(_req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
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
        orderBy: { createdAt: "asc" },
      },
      invoice: { select: { id: true, number: true, issuedAt: true } },
    },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const customerPublicId =
    order.user.customers?.publicCustomerId ??
    (await ensureCustomerPublicId(prisma, order.userId));

  return NextResponse.json({
    ...serializeOrderDetail({
      ...order,
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
        customers: { publicCustomerId: customerPublicId },
      },
    }),
    invoice: order.invoice,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending orders can be edited or cancelled." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const allowedUpdates: Record<string, string> = {};

    if (typeof body.shippingAddress === "string") {
      allowedUpdates.shippingAddress = body.shippingAddress.trim();
    }
    if (typeof body.shippingCity === "string") {
      allowedUpdates.shippingCity = body.shippingCity.trim();
    }
    if (typeof body.shippingPhone === "string") {
      allowedUpdates.shippingPhone = body.shippingPhone.trim();
    }
    if (typeof body.paymentId === "string") {
      allowedUpdates.paymentId = body.paymentId.trim();
    }
    if (body.status === "cancelled") {
      allowedUpdates.status = "cancelled";
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: allowedUpdates,
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
          orderBy: { createdAt: "asc" },
        },
        invoice: { select: { id: true, number: true, issuedAt: true } },
      },
    });

    const customerPublicId =
      updatedOrder.user.customers?.publicCustomerId ??
      (await ensureCustomerPublicId(prisma, updatedOrder.userId));

    return NextResponse.json({
      ...serializeOrderDetail({
        ...updatedOrder,
        user: {
          id: updatedOrder.user.id,
          name: updatedOrder.user.name,
          email: updatedOrder.user.email,
          customers: { publicCustomerId: customerPublicId },
        },
      }),
      invoice: updatedOrder.invoice,
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Failed to update order" },
      { status: 500 }
    );
  }
}
