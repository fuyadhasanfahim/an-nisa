import { prisma } from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/get-session";
import { NextResponse } from "next/server";
import { normalizeOrderListQuery } from "@/lib/validators/order-list.query";
import type { Prisma } from "@prisma/client";
import { serializeOrderListItem } from "@/lib/orders/order-list-item";
import { ensureCustomerPublicId } from "@/lib/ids/public-ref";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = normalizeOrderListQuery({
      q: searchParams.get("q") ?? "",
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const searchParts: Prisma.OrderWhereInput[] = [{ userId: session.user.id }];
    if (q.q.length > 0) {
      searchParts.push({
        OR: [
          { id: { contains: q.q } },
          { status: { contains: q.q, mode: "insensitive" } },
          { shippingCity: { contains: q.q, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.OrderWhereInput =
      searchParts.length === 1 ? searchParts[0]! : { AND: searchParts };

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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            customers: { select: { publicCustomerId: true } },
          },
        },
        items: { select: { quantity: true } },
        invoice: { select: { id: true, number: true } },
      },
    });

    const items = await Promise.all(
      orders.map(async (o) => {
        const publicId =
          o.user.customers?.publicCustomerId ??
          (await ensureCustomerPublicId(prisma, o.userId));
        return serializeOrderListItem({
          ...o,
          user: {
            ...o.user,
            customers: { publicCustomerId: publicId },
          },
        });
      })
    );

    return NextResponse.json({
      items,
      total,
      page,
      limit: q.limit,
      totalPages,
      sort: q.sort,
      order: q.order,
      q: q.q,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
