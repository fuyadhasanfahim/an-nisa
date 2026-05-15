import { baseApi } from "@/store/api/baseApi";
import type { OrderListQuery } from "@/lib/validators/order-list.query";
import type {
  OrderWriteInput,
  OrderStatus,
} from "@/lib/validators/order.schema";

export type OrderUserMini = {
  id: string;
  name: string;
  email: string;
};

export type OrderListItemDto = {
  id: string;
  userId: string;
  status: string;
  totalCents: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  user: OrderUserMini;
  customerPublicId: string | null;
  /** Sum of line-item quantities (pieces / units), not number of rows. */
  totalQuantity: number;
  invoice: { id: string; number: string } | null;
};

export type OrderLineDto = {
  id: string;
  productId: string;
  quantity: number;
  unitCents: number;
  createdAt: string;
  product: { id: string; name: string; slug: string };
};

export type OrderDetailDto = {
  id: string;
  userId: string;
  status: string;
  subtotalCents: number;
  discountCents: number;
  shippingFeeCents: number;
  totalCents: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentId: string;
  paymentCollectedVia: string;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingCountry: string;
  createdAt: string;
  updatedAt: string;
  customerPublicId: string | null;
  user: OrderUserMini;
  items: OrderLineDto[];
};

export type OrderListResponse = {
  items: OrderListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sort: OrderListQuery["sort"];
  order: OrderListQuery["order"];
  q: string;
};

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listOrders: build.query<OrderListResponse, OrderListQuery>({
      query: (params) => ({
        url: "/orders",
        params: {
          ...(params.q ? { q: params.q } : {}),
          sort: params.sort,
          order: params.order,
          page: params.page,
          limit: params.limit,
          ...(params.withoutInvoice ? { withoutInvoice: "1" } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((o) => ({
                type: "Order" as const,
                id: o.id,
              })),
              { type: "Order" as const, id: "LIST" },
            ]
          : [{ type: "Order" as const, id: "LIST" }],
    }),
    getOrderById: build.query<OrderDetailDto, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Order" as const, id }],
    }),
    createOrder: build.mutation<OrderDetailDto, OrderWriteInput>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    updateOrder: build.mutation<
      OrderDetailDto,
      { id: string; data: OrderWriteInput }
    >({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Order", id: arg.id },
        { type: "Order", id: "LIST" },
      ],
    }),
    patchOrder: build.mutation<
      OrderDetailDto,
      {
        id: string;
        body: Partial<{
          status: OrderStatus;
          paymentStatus: "pending" | "paid";
        }>;
      }
    >({
      query: ({ id, body }) => ({
        url: `/orders/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Order", id: arg.id },
        { type: "Order", id: "LIST" },
      ],
    }),
    deleteOrder: build.mutation<void, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  usePatchOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;
