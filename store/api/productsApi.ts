import { baseApi } from "@/store/api/baseApi";
import type { ProductInput } from "@/lib/validators/product.schema";
import type { ProductListQuery } from "@/lib/validators/product-list.query";

export type ProductDto = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  priceCents: number;
  discountPriceCents: number | null;
  currency: string;
  images: string[];
  isActive: boolean;
  stockQuantity: number;
  trackInventory: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductListResponse = {
  items: ProductDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sort: ProductListQuery["sort"];
  order: ProductListQuery["order"];
  q: string;
};

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listProducts: build.query<ProductListResponse, ProductListQuery>({
      query: (params) => ({
        url: "/products",
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
              ...result.items.map((p) => ({
                type: "Product" as const,
                id: p.id,
              })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),
    createProduct: build.mutation<ProductDto, ProductInput>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product" as const, id: "LIST" }],
    }),
    getProductById: build.query<ProductDto, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Product" as const, id }],
    }),
    updateProduct: build.mutation<
      ProductDto,
      { id: string; data: ProductInput }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Product" as const, id: arg.id },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
    patchProduct: build.mutation<
      ProductDto,
      { id: string; body: { isActive: boolean } }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Product" as const, id: arg.id },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Product" as const, id },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListProductsQuery,
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  usePatchProductMutation,
  useDeleteProductMutation,
} = productsApi;

