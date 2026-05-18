import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { expenseUpdateSchema } from "@/lib/validators/expense-admin.schema";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const { id } = await params;

  try {
    const json: unknown = await req.json();
    const parsed = expenseUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const b = parsed.data;
    const data: Prisma.ExpenseUpdateInput = {};
    if (b.title !== undefined) data.title = b.title;
    if (b.amountCents !== undefined) data.amountCents = b.amountCents;
    if (b.currency !== undefined) data.currency = b.currency;
    if (b.category !== undefined) data.category = b.category;
    if (b.description !== undefined) data.description = b.description;
    if (b.spentAt !== undefined) data.spentAt = new Date(b.spentAt);

    const row = await prisma.expense.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        amountCents: true,
        currency: true,
        spentAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      item: {
        ...row,
        spentAt: row.spentAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
      },
    });
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const { id } = await params;

  try {
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 },
    );
  }
}
