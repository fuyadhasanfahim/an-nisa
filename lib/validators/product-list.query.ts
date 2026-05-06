export const PRODUCT_PAGE_SIZES = [20, 50, 100] as const;
export type ProductPageSize = (typeof PRODUCT_PAGE_SIZES)[number];

export const PRODUCT_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "priceCents",
] as const;
export type ProductListSortField = (typeof PRODUCT_SORT_FIELDS)[number];

export type ProductListQuery = {
  q: string;
  sort: ProductListSortField;
  order: "asc" | "desc";
  page: number;
  limit: ProductPageSize;
};

export function normalizeProductListQuery(input: {
  q?: string | null;
  sort?: string | null;
  order?: string | null;
  page?: string | number | null;
  limit?: string | number | null;
}): ProductListQuery {
  const q = String(input.q ?? "")
    .trim()
    .slice(0, 200);
  const sortRaw = String(input.sort ?? "createdAt");
  const sort: ProductListSortField = (
    PRODUCT_SORT_FIELDS as readonly string[]
  ).includes(sortRaw)
    ? (sortRaw as ProductListSortField)
    : "createdAt";
  const order: "asc" | "desc" = input.order === "asc" ? "asc" : "desc";
  let page = Number(input.page ?? 1);
  if (!Number.isFinite(page) || page < 1) page = 1;
  page = Math.floor(page);
  let rawLimit = Number(input.limit ?? 20);
  if (!Number.isFinite(rawLimit)) rawLimit = 20;
  const limit: ProductPageSize =
    rawLimit === 50 || rawLimit === 100 ? rawLimit : 20;
  return { q, sort, order, page, limit };
}
