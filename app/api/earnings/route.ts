import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { paymentMethodLabel } from "@/lib/orders/payment-method-label";
import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  eachDayOfInterval,
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

export async function GET(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const days = parseDays(searchParams.get("days"));

    const end = startOfDay(new Date());
    const start = startOfDay(subDays(end, days - 1));

    const [
      paidSumLifetime,
      paidCountLifetime,
      pendingSumLifetime,
      pendingCountLifetime,
      currencyRow,
      ordersInRange,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.paid },
        _sum: { totalCents: true },
      }),
      prisma.order.count({ where: { paymentStatus: PaymentStatus.paid } }),
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.pending },
        _sum: { totalCents: true },
      }),
      prisma.order.count({ where: { paymentStatus: PaymentStatus.pending } }),
      prisma.order.findFirst({
        select: { currency: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: start } },
        select: {
          createdAt: true,
          totalCents: true,
          paymentStatus: true,
          paymentMethod: true,
          status: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const currency = currencyRow?.currency ?? "BDT";

    const intervalDays = eachDayOfInterval({ start, end });
    const daily = intervalDays.map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "MMM d"),
      paidCents: 0,
      paidOrders: 0,
    }));
    const dailyIndex = new Map(daily.map((d, i) => [d.date, i]));

    let rangePaidCents = 0;
    let rangePaidCount = 0;

    const methodAcc = new Map<
      string,
      { revenueCents: number; orderCount: number }
    >();
    const statusAcc = new Map<string, number>();

    for (const o of ordersInRange) {
      statusAcc.set(o.status, (statusAcc.get(o.status) ?? 0) + 1);

      if (o.paymentStatus !== PaymentStatus.paid) continue;

      rangePaidCents += o.totalCents;
      rangePaidCount += 1;

      const dayKey = format(startOfDay(o.createdAt), "yyyy-MM-dd");
      const idx = dailyIndex.get(dayKey);
      if (idx !== undefined) {
        daily[idx].paidCents += o.totalCents;
        daily[idx].paidOrders += 1;
      }

      const m = o.paymentMethod;
      const cur = methodAcc.get(m) ?? { revenueCents: 0, orderCount: 0 };
      cur.revenueCents += o.totalCents;
      cur.orderCount += 1;
      methodAcc.set(m, cur);
    }

    const avgPaidOrderCents =
      rangePaidCount > 0 ? Math.round(rangePaidCents / rangePaidCount) : 0;

    const byPaymentMethod = [...methodAcc.entries()]
      .map(([method, v]) => ({
        method,
        label: paymentMethodLabel(method),
        revenueCents: v.revenueCents,
        orderCount: v.orderCount,
      }))
      .sort((a, b) => b.revenueCents - a.revenueCents);

    const byOrderStatus = [...statusAcc.entries()]
      .map(([status, orderCount]) => ({ status, orderCount }))
      .sort((a, b) => b.orderCount - a.orderCount);

    return NextResponse.json({
      rangeDays: days,
      currency,
      lifetime: {
        paidRevenueCents: paidSumLifetime._sum.totalCents ?? 0,
        paidOrderCount: paidCountLifetime,
        pendingRevenueCents: pendingSumLifetime._sum.totalCents ?? 0,
        pendingOrderCount: pendingCountLifetime,
      },
      inRange: {
        paidRevenueCents: rangePaidCents,
        paidOrderCount: rangePaidCount,
        avgPaidOrderCents,
        totalOrderCount: ordersInRange.length,
      },
      daily,
      byPaymentMethod,
      byOrderStatus,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load earnings" },
      { status: 500 }
    );
  }
}
