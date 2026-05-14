import { baseApi } from "@/store/api/baseApi";

export type EarningsDayPoint = {
  date: string;
  label: string;
  paidCents: number;
  paidOrders: number;
};

export type EarningsMethodSlice = {
  method: string;
  label: string;
  revenueCents: number;
  orderCount: number;
};

export type EarningsStatusSlice = {
  status: string;
  orderCount: number;
};

export type EarningsResponse = {
  rangeDays: number;
  currency: string;
  lifetime: {
    paidRevenueCents: number;
    paidOrderCount: number;
    pendingRevenueCents: number;
    pendingOrderCount: number;
  };
  inRange: {
    paidRevenueCents: number;
    paidOrderCount: number;
    avgPaidOrderCents: number;
    totalOrderCount: number;
  };
  daily: EarningsDayPoint[];
  byPaymentMethod: EarningsMethodSlice[];
  byOrderStatus: EarningsStatusSlice[];
};

export const earningsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEarnings: build.query<EarningsResponse, { days: number }>({
      query: ({ days }) => ({
        url: "/earnings",
        params: { days },
      }),
    }),
  }),
});

export const { useGetEarningsQuery } = earningsApi;
