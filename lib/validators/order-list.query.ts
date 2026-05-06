export const ORDER_PAGE_SIZES = [20, 50, 100] as const;
export type OrderPageSize = (typeof ORDER_PAGE_SIZES)[number];

export const ORDER_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "totalCents",
  "status",
] as const;
export type OrderListSortField = (typeof ORDER_SORT_FIELDS)[number];

export type OrderListQuery = {
  q: string;
  sort: OrderListSortField;
  order: "asc" | "desc";
  page: number;
  limit: OrderPageSize;
};

export function normalizeOrderListQuery(input: {
  q?: string | null;
  sort?: string | null;
  order?: string | null;
  page?: string | number | null;
  limit?: string | number | null;
}): OrderListQuery {
  const q = String(input.q ?? "")
    .trim()
    .slice(0, 200);
  const sortRaw = String(input.sort ?? "createdAt");
  const sort: OrderListSortField = (
    ORDER_SORT_FIELDS as readonly string[]
  ).includes(sortRaw)
    ? (sortRaw as OrderListSortField)
    : "createdAt";
  const order: "asc" | "desc" = input.order === "asc" ? "asc" : "desc";
  let page = Number(input.page ?? 1);
  if (!Number.isFinite(page) || page < 1) page = 1;
  page = Math.floor(page);
  let rawLimit = Number(input.limit ?? 20);
  if (!Number.isFinite(rawLimit)) rawLimit = 20;
  const limit: OrderPageSize =
    rawLimit === 50 || rawLimit === 100 ? rawLimit : 20;
  return { q, sort, order, page, limit };
}
