import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { ensureCustomerPublicId } from "@/lib/ids/public-ref";
import { serializeOrderListItem } from "@/lib/orders/order-list-item";
import { PaymentStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  eachDayOfInterval,
  format,
  startOfDay,
  subDays,
} from "date-fns";

export const runtime = "nodejs";

const CHART_DAYS = 30;

export async function GET(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const end = startOfDay(new Date());
    const start = startOfDay(subDays(end, CHART_DAYS - 1));

    const [
      totalOrders,
      paidOrderCount,
      pendingPaymentOrderCount,
      paidSumLifetime,
      pendingSumLifetime,
      customersCount,
      productsTotal,
      productsActive,
      invoicesCount,
      expenseSumLifetime,
      currencyRow,
      ordersInChartRange,
      recentOrdersRaw,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: PaymentStatus.paid } }),
      prisma.order.count({
        where: { paymentStatus: PaymentStatus.pending },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.paid },
        _sum: { totalCents: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.pending },
        _sum: { totalCents: true },
      }),
      prisma.user.count({ where: { role: Role.user } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.invoice.count(),
      prisma.expense.aggregate({ _sum: { amountCents: true } }),
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
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
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
      }),
    ]);

    const currency = currencyRow?.currency ?? "BDT";

    const intervalDays = eachDayOfInterval({ start, end });
    const daily = intervalDays.map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "MMM d"),
      paidCents: 0,
      paidOrders: 0,
      orderCount: 0,
    }));
    const dailyIndex = new Map(daily.map((d, i) => [d.date, i]));

    for (const o of ordersInChartRange) {
      const dayKey = format(startOfDay(o.createdAt), "yyyy-MM-dd");
      const idx = dailyIndex.get(dayKey);
      if (idx === undefined) continue;
      daily[idx].orderCount += 1;
      if (o.paymentStatus === PaymentStatus.paid) {
        daily[idx].paidCents += o.totalCents;
        daily[idx].paidOrders += 1;
      }
    }

    const recentOrders = await Promise.all(
      recentOrdersRaw.map(async (o) => {
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
      }),
    );

    return NextResponse.json({
      currency,
      chartDays: CHART_DAYS,
      stats: {
        totalOrders,
        paidOrderCount,
        pendingPaymentOrderCount,
        lifetimePaidRevenueCents: paidSumLifetime._sum.totalCents ?? 0,
        lifetimePendingRevenueCents: pendingSumLifetime._sum.totalCents ?? 0,
        customersCount,
        productsTotal,
        productsActive,
        invoicesCount,
        lifetimeExpenseCents: expenseSumLifetime._sum.amountCents ?? 0,
      },
      daily,
      recentOrders,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load overview" },
      { status: 500 },
    );
  }
}
