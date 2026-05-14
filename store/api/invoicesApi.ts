import { baseApi } from "@/store/api/baseApi";
import type { InvoiceListQuery } from "@/lib/validators/invoice-list.query";
import type { OrderUserMini } from "@/store/api/ordersApi";

export type InvoiceListItemDto = {
  id: string;
  orderId: string;
  number: string;
  totalCents: number;
  currency: string;
  issuedAt: string;
  user: OrderUserMini;
  order: { id: string; status: string };
};

export type InvoiceListResponse = {
  items: InvoiceListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sort: InvoiceListQuery["sort"];
  order: InvoiceListQuery["order"];
  q: string;
};

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listInvoices: build.query<InvoiceListResponse, InvoiceListQuery>({
      query: (params) => ({
        url: "/invoices",
        params: {
          ...(params.q ? { q: params.q } : {}),
          sort: params.sort,
          order: params.order,
          page: params.page,
          limit: params.limit,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((inv) => ({
                type: "Invoice" as const,
                id: inv.id,
              })),
              { type: "Invoice" as const, id: "LIST" },
            ]
          : [{ type: "Invoice" as const, id: "LIST" }],
    }),
    createInvoice: build.mutation<InvoiceListItemDto, { orderId: string }>({
      query: (body) => ({
        url: "/invoices",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Invoice", id: "LIST" },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const { useListInvoicesQuery, useCreateInvoiceMutation } = invoicesApi;
