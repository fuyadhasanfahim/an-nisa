import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { normalizeInvoiceListQuery } from "@/lib/validators/invoice-list.query";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const runtime = "nodejs";

function makeInvoiceNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  return `INV-${y}${m}${day}-${rand}`;
}

function serializeInvoice(
  inv: Prisma.InvoiceGetPayload<{
    include: {
      user: { select: { id: true; name: true; email: true } };
      order: { select: { id: true; status: true } };
    };
  }>
) {
  return {
    id: inv.id,
    orderId: inv.orderId,
    number: inv.number,
    totalCents: inv.totalCents,
    currency: inv.currency,
    issuedAt: inv.issuedAt.toISOString(),
    user: inv.user,
    order: inv.order,
  };
}

export async function GET(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const q = normalizeInvoiceListQuery({
      q: searchParams.get("q") ?? "",
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const searchWhere: Prisma.InvoiceWhereInput =
      q.q.length > 0
        ? {
            OR: [
              { number: { contains: q.q, mode: "insensitive" } },
              { orderId: { contains: q.q } },
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

    const where: Prisma.InvoiceWhereInput =
      Object.keys(searchWhere).length > 0 ? searchWhere : {};

    const orderBy = {
      [q.sort]: q.order,
    } as Prisma.InvoiceOrderByWithRelationInput;

    const total = await prisma.invoice.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / q.limit));
    const page = Math.min(Math.max(1, q.page), totalPages);
    const skip = (page - 1) * q.limit;

    const rows = await prisma.invoice.findMany({
      where,
      orderBy,
      skip,
      take: q.limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json({
      items: rows.map(serializeInvoice),
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
      { error: "Failed to list invoices" },
      { status: 500 }
    );
  }
}

const createInvoiceBody = z.object({
  orderId: z.string().min(1),
});

export async function POST(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const json = await req.json();
    const { orderId } = createInvoiceBody.parse(json);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { invoice: { select: { id: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.invoice) {
      return NextResponse.json(
        { error: "This order already has an invoice" },
        { status: 409 }
      );
    }

    const created = await prisma.invoice.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        number: makeInvoiceNumber(),
        totalCents: order.totalCents,
        currency: order.currency,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json(serializeInvoice(created), { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Invoice number collision — try again" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
