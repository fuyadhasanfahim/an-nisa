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
