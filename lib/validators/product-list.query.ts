export const PRODUCT_PAGE_SIZES = [20, 50, 100] as const;
export type ProductPageSize = (typeof PRODUCT_PAGE_SIZES)[number];

/** Base Prisma sort fields (also used for admin table). */
export const PRODUCT_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "priceCents",
  "ratingAverage",
  "ratingCount",
] as const;
export type ProductListSortField = (typeof PRODUCT_SORT_FIELDS)[number];

/** Preset sort modes for the storefront (mapped to Prisma `orderBy` in the API). */
export const PRODUCT_SORT_MODES = [
  "latest",
  "popular",
  "price_asc",
  "price_desc",
  "top_rated",
] as const;
export type ProductSortMode = (typeof PRODUCT_SORT_MODES)[number];

export type ProductListQuery = {
  q: string;
  sort: ProductListSortField;
  order: "asc" | "desc";
  page: number;
  limit: ProductPageSize;
  sortMode?: ProductSortMode;
};

export type ProductListFilters = {
  category?: string;
  priceMinCents?: number;
  priceMaxCents?: number;
  size?: string;
  color?: string;
  fabricType?: string;
  embroideryType?: string;
  minRating?: number;
  inStockOnly?: boolean;
  brand?: string;
  onSaleOnly?: boolean;
  trendingOnly?: boolean;
  handmadeOnly?: boolean;
  featuredOnly?: boolean;
  /** Admin — list inactive/draft products */
  includeInactive?: boolean;
  /** Merchandising slice (API applies additional `where`) */
  heroOnly?: boolean;
  topRatedOnly?: boolean;
  comboOnly?: boolean;
  boutiquePickOnly?: boolean;
  newArrivalOnly?: boolean;
  embroideryCollection?: boolean;
  handmadeCollection?: boolean;
};

export function normalizeProductListQuery(input: {
  q?: string | null;
  sort?: string | null;
  order?: string | null;
  page?: string | number | null;
  limit?: string | number | null;
  sortMode?: string | null;
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
  const sm = String(input.sortMode ?? "").trim();
  const sortMode = (PRODUCT_SORT_MODES as readonly string[]).includes(sm)
    ? (sm as ProductSortMode)
    : undefined;
  return { q, sort, order, page, limit, sortMode };
}

function parseIntParam(v: string | null): number | undefined {
  if (v == null || v.trim() === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.floor(n);
}

function parseFloatParam(v: string | null): number | undefined {
  if (v == null || v.trim() === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function parseBool(v: string | null): boolean | undefined {
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return undefined;
}

export function productFiltersFromSearchParams(
  sp: URLSearchParams
): ProductListFilters {
  return {
    category: sp.get("category")?.trim() || undefined,
    priceMinCents: parseIntParam(sp.get("priceMin")),
    priceMaxCents: parseIntParam(sp.get("priceMax")),
    size: sp.get("size")?.trim() || undefined,
    color: sp.get("color")?.trim() || undefined,
    fabricType: sp.get("fabric")?.trim() || undefined,
    embroideryType: sp.get("embroidery")?.trim() || undefined,
    minRating: parseFloatParam(sp.get("minRating")),
    inStockOnly: parseBool(sp.get("inStock")),
    brand: sp.get("brand")?.trim() || undefined,
    onSaleOnly: parseBool(sp.get("onSale")),
    trendingOnly: parseBool(sp.get("trending")),
    handmadeOnly: parseBool(sp.get("handmade")),
    featuredOnly: parseBool(sp.get("featured")),
    includeInactive: parseBool(sp.get("includeInactive")),
    heroOnly: parseBool(sp.get("hero")),
    topRatedOnly: parseBool(sp.get("topRated")),
    comboOnly: parseBool(sp.get("combo")),
    boutiquePickOnly: parseBool(sp.get("boutique")),
    newArrivalOnly: parseBool(sp.get("newArrival")),
    embroideryCollection: parseBool(sp.get("embroideryCollection")),
    handmadeCollection: parseBool(sp.get("handmadeCollection")),
  };
}

/** Maps storefront `sortMode` to Prisma orderBy (overrides sort/order when set). */
export function orderByFromSortMode(
  mode: ProductSortMode | undefined,
  fallback: { sort: ProductListSortField; order: "asc" | "desc" }
): { field: ProductListSortField; order: "asc" | "desc" } {
  if (!mode) return { field: fallback.sort, order: fallback.order };
  switch (mode) {
    case "latest":
      return { field: "createdAt", order: "desc" };
    case "popular":
      return { field: "ratingCount", order: "desc" };
    case "price_asc":
      return { field: "priceCents", order: "asc" };
    case "price_desc":
      return { field: "priceCents", order: "desc" };
    case "top_rated":
      return { field: "ratingAverage", order: "desc" };
    default:
      return { field: fallback.sort, order: fallback.order };
  }
}
