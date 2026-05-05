import { baseApi } from "@/store/api/baseApi";
import type { ProductInput } from "@/lib/validators/product.schema";

export type ProductDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  currency: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listProducts: build.query<ProductDto[], void>({
      query: () => "/products",
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Product" as const, id: p.id })),
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
  }),
});

export const {
  useListProductsQuery,
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
} = productsApi;

