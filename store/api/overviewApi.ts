import { baseApi } from "@/store/api/baseApi";
import type { OrderListItemDto } from "@/store/api/ordersApi";

export type OverviewDaily = {
  date: string;
  label: string;
  paidCents: number;
  paidOrders: number;
  orderCount: number;
};

export type OverviewResponse = {
  currency: string;
  chartDays: number;
  stats: {
    totalOrders: number;
    paidOrderCount: number;
    pendingPaymentOrderCount: number;
    lifetimePaidRevenueCents: number;
    lifetimePendingRevenueCents: number;
    customersCount: number;
    productsTotal: number;
    productsActive: number;
    invoicesCount: number;
    lifetimeExpenseCents: number;
  };
  daily: OverviewDaily[];
  recentOrders: OrderListItemDto[];
};

export const overviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOverview: build.query<OverviewResponse, void>({
      query: () => ({ url: "/admin/overview" }),
    }),
  }),
});

export const { useGetOverviewQuery } = overviewApi;
