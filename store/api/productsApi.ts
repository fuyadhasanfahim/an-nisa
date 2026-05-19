import { baseApi } from "@/store/api/baseApi";
import type { ProductInput } from "@/lib/validators/product.schema";
import {
  normalizeProductListQuery,
  type ProductListFilters,
  type ProductListQuery,
  type ProductListSortField,
} from "@/lib/validators/product-list.query";
import { appendProductFilters } from "@/lib/products/append-product-filters";

export type ProductDto = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  priceCents: number;
  discountPriceCents: number | null;
  effectivePriceCents: number;
  currency: string;
  images: string[];
  isActive: boolean;
  stockQuantity: number;
  trackInventory: boolean;
  category: string;
  tags: string[];
  brand: string | null;
  sizes: string[];
  colors: string[];
  fabricType: string | null;
  embroideryType: string | null;
  ratingAverage: number;
  ratingCount: number;
  showInHero: boolean;
  featured: boolean;
  isTopRated: boolean;
  isCombo: boolean;
  trending: boolean;
  handmade: boolean;
  boutiquePick: boolean;
  newArrival: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductListApiParams = ProductListQuery &
  Partial<ProductListFilters>;

export type ProductListResponse = {
  items: ProductDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Effective Prisma field used for sorting. */
  sort: ProductListSortField;
  order: "asc" | "desc";
  sortMode?: string | null;
  q: string;
};

function serializeProductListParams(p: Partial<ProductListApiParams>): string {
  const normalized = normalizeProductListQuery({
    q: p.q,
    sort: p.sort,
    order: p.order,
    page: p.page,
    limit: p.limit,
    sortMode: p.sortMode,
  });

  const sp = new URLSearchParams();
  if (normalized.q) sp.set("q", normalized.q);
  sp.set("sort", normalized.sort);
  sp.set("order", normalized.order);
  sp.set("page", String(normalized.page));
  sp.set("limit", String(normalized.limit));
  if (normalized.sortMode) sp.set("sortMode", normalized.sortMode);

  const filterKeys: Array<keyof ProductListFilters> = [
    "category",
    "priceMinCents",
    "priceMaxCents",
    "size",
    "color",
    "fabricType",
    "embroideryType",
    "minRating",
    "inStockOnly",
    "brand",
    "onSaleOnly",
    "trendingOnly",
    "handmadeOnly",
    "featuredOnly",
    "includeInactive",
    "heroOnly",
    "topRatedOnly",
    "comboOnly",
    "boutiquePickOnly",
    "newArrivalOnly",
    "embroideryCollection",
    "handmadeCollection",
  ];

  const filters: Partial<ProductListFilters> = {};
  for (const k of filterKeys) {
    const v = p[k];
    if (v !== undefined) (filters as Record<string, unknown>)[k as string] = v;
  }
  appendProductFilters(sp, filters);
  const qs = sp.toString();
  return qs.length ? `?${qs}` : "";
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listProducts: build.query<ProductListResponse, Partial<ProductListApiParams>>({
      query: (params) => ({
        url: `/products${serializeProductListParams(params)}`,
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
    getProductFilters: build.query<{
      categories: Array<{ label: string; value: string }>;
      fabricTypes: string[];
      sizes: string[];
      colors: Array<{ name: string; value: string; hex: string }>;
    }, void>({
      query: () => "/products/filters",
      providesTags: [{ type: "Product" as const, id: "LIST" }],
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
  useGetProductFiltersQuery,
} = productsApi;
