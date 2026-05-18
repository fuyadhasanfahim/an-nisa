import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { expenseCreateSchema } from "@/lib/validators/expense-admin.schema";
import { NextResponse } from "next/server";
import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from "date-fns";

export const runtime = "nodejs";

const RANGE_MIN = 7;
const RANGE_MAX = 90;
const RANGE_DEFAULT = 30;

function parseDays(raw: string | null): number {
  const n = Number(raw ?? RANGE_DEFAULT);
  if (!Number.isFinite(n)) return RANGE_DEFAULT;
  return Math.min(RANGE_MAX, Math.max(RANGE_MIN, Math.floor(n)));
}

function categoryLabel(raw: string | null | undefined): string {
  const s = raw?.trim();
  return s && s.length > 0 ? s : "Uncategorized";
}

export async function GET(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const days = parseDays(searchParams.get("days"));

    const rangeEndDay = startOfDay(new Date());
    const rangeStartDay = startOfDay(subDays(rangeEndDay, days - 1));
    const rangeStart = rangeStartDay;
    const rangeEnd = endOfDay(rangeEndDay);

    const [lifetimeAgg, lifetimeCount, currencyRow, expensesInRange] =
      await Promise.all([
        prisma.expense.aggregate({
          _sum: { amountCents: true },
        }),
        prisma.expense.count(),
        prisma.expense.findFirst({
          select: { currency: true },
          orderBy: { spentAt: "desc" },
        }),
        prisma.expense.findMany({
          where: {
            spentAt: { gte: rangeStart, lte: rangeEnd },
          },
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
          orderBy: { spentAt: "desc" },
        }),
      ]);

    const currency = currencyRow?.currency ?? "BDT";

    const intervalDays = eachDayOfInterval({
      start: rangeStartDay,
      end: rangeEndDay,
    });
    const daily = intervalDays.map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "MMM d"),
      expenseCents: 0,
      expenseCount: 0,
    }));
    const dailyIndex = new Map(daily.map((d, i) => [d.date, i]));

    let rangeExpenseCents = 0;
    const catAcc = new Map<
      string,
      { label: string; expenseCents: number; expenseCount: number }
    >();

    for (const e of expensesInRange) {
      rangeExpenseCents += e.amountCents;

      const dayKey = format(startOfDay(e.spentAt), "yyyy-MM-dd");
      const idx = dailyIndex.get(dayKey);
      if (idx !== undefined) {
        daily[idx].expenseCents += e.amountCents;
        daily[idx].expenseCount += 1;
      }

      const label = categoryLabel(e.category);
      const key = label.toLowerCase();
      const cur = catAcc.get(key) ?? {
        label,
        expenseCents: 0,
        expenseCount: 0,
      };
      cur.expenseCents += e.amountCents;
      cur.expenseCount += 1;
      catAcc.set(key, cur);
    }

    const rangeExpenseCount = expensesInRange.length;
    const avgExpenseCents =
      rangeExpenseCount > 0
        ? Math.round(rangeExpenseCents / rangeExpenseCount)
        : 0;

    const byCategory = [...catAcc.values()].sort(
      (a, b) => b.expenseCents - a.expenseCents,
    );

    const transactions = expensesInRange.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      amountCents: e.amountCents,
      currency: e.currency,
      spentAt: e.spentAt.toISOString(),
      createdAt: e.createdAt.toISOString(),
    }));

    return NextResponse.json({
      rangeDays: days,
      currency,
      lifetime: {
        totalExpenseCents: lifetimeAgg._sum.amountCents ?? 0,
        expenseCount: lifetimeCount,
      },
      inRange: {
        totalExpenseCents: rangeExpenseCents,
        expenseCount: rangeExpenseCount,
        avgExpenseCents,
      },
      daily,
      byCategory,
      transactions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load expenses" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const json: unknown = await req.json();
    const parsed = expenseCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const spentAt = body.spentAt ? new Date(body.spentAt) : new Date();

    const row = await prisma.expense.create({
      data: {
        title: body.title,
        amountCents: body.amountCents,
        currency: body.currency,
        category: body.category,
        description: body.description,
        spentAt,
      },
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
  } catch {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 },
    );
  }
}
