import { baseApi } from "@/store/api/baseApi";
import type { CheckoutInput } from "@/lib/validators/checkout.schema";
import type { OrderDetailDto, OrderListResponse } from "@/store/api/ordersApi";

export type MyOrderDetail = OrderDetailDto & {
  invoice: { id: string; number: string; issuedAt: string } | null;
};

export const customerOrdersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    checkout: build.mutation<OrderDetailDto, CheckoutInput>({
      query: (body) => ({
        url: "/checkout",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Order", id: "MY_LIST" },
        { type: "Order", id: "LIST" },
      ],
    }),
    listMyOrders: build.query<OrderListResponse, void>({
      query: () => ({ url: "/me/orders" }),
      providesTags: [{ type: "Order", id: "MY_LIST" }],
    }),
    getMyOrder: build.query<MyOrderDetail, string>({
      query: (id) => `/me/orders/${id}`,
      providesTags: (_res, _e, id) => [{ type: "Order", id: `MY:${id}` }],
    }),
    updateMyOrder: build.mutation<
      MyOrderDetail,
      {
        id: string;
        shippingAddress?: string;
        shippingCity?: string;
        shippingPhone?: string;
        paymentId?: string;
        status?: string;
        items?: Array<{ productId: string; quantity: number }>;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/me/orders/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _e, { id }) => [
        { type: "Order", id: `MY:${id}` },
        { type: "Order", id: "MY_LIST" },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCheckoutMutation,
  useListMyOrdersQuery,
  useGetMyOrderQuery,
  useUpdateMyOrderMutation,
} = customerOrdersApi;
