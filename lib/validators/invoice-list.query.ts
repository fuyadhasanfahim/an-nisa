export const INVOICE_PAGE_SIZES = [20, 50, 100] as const;
export type InvoicePageSize = (typeof INVOICE_PAGE_SIZES)[number];

export const INVOICE_SORT_FIELDS = [
  "issuedAt",
  "number",
  "totalCents",
] as const;
export type InvoiceListSortField = (typeof INVOICE_SORT_FIELDS)[number];

export type InvoiceListQuery = {
  q: string;
  sort: InvoiceListSortField;
  order: "asc" | "desc";
  page: number;
  limit: InvoicePageSize;
};

export function normalizeInvoiceListQuery(input: {
  q?: string | null;
  sort?: string | null;
  order?: string | null;
  page?: string | number | null;
  limit?: string | number | null;
}): InvoiceListQuery {
  const q = String(input.q ?? "")
    .trim()
    .slice(0, 200);
  const sortRaw = String(input.sort ?? "issuedAt");
  const sort: InvoiceListSortField = (
    INVOICE_SORT_FIELDS as readonly string[]
  ).includes(sortRaw)
    ? (sortRaw as InvoiceListSortField)
    : "issuedAt";
  const order: "asc" | "desc" = input.order === "asc" ? "asc" : "desc";
  let page = Number(input.page ?? 1);
  if (!Number.isFinite(page) || page < 1) page = 1;
  page = Math.floor(page);
  let rawLimit = Number(input.limit ?? 20);
  if (!Number.isFinite(rawLimit)) rawLimit = 20;
  const limit: InvoicePageSize =
    rawLimit === 50 || rawLimit === 100 ? rawLimit : 20;
  return { q, sort, order, page, limit };
}
