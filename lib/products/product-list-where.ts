import type { Prisma } from "@prisma/client";
import type { ProductListFilters } from "@/lib/validators/product-list.query";

export function buildProductWhere(args: {
  q: string;
  filters: ProductListFilters;
  requireActive: boolean;
}): Prisma.ProductWhereInput {
  const { q, filters, requireActive } = args;
  const AND: Prisma.ProductWhereInput[] = [];

  if (requireActive) {
    AND.push({ isActive: true });
  }

  if (q.length > 0) {
    const tokens = [...new Set(q.split(/\s+/).map((t) => t.trim()).filter(Boolean))].slice(
      0,
      6
    );
    const or: Prisma.ProductWhereInput[] = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ];
    if (tokens.length > 0) {
      or.push({ tags: { hasSome: tokens } });
    }
    AND.push({ OR: or });
  }

  if (filters.category) AND.push({ category: filters.category });
  if (filters.brand) AND.push({ brand: { contains: filters.brand, mode: "insensitive" } });
  if (filters.fabricType) {
    AND.push({ fabricType: { contains: filters.fabricType, mode: "insensitive" } });
  }
  if (filters.embroideryType) {
    AND.push({
      embroideryType: { contains: filters.embroideryType, mode: "insensitive" },
    });
  }
  if (filters.size) AND.push({ sizes: { has: filters.size } });
  if (filters.color) AND.push({ colors: { has: filters.color } });

  if (filters.priceMinCents != null || filters.priceMaxCents != null) {
    const range: Prisma.IntFilter = {};
    if (filters.priceMinCents != null) range.gte = filters.priceMinCents;
    if (filters.priceMaxCents != null) range.lte = filters.priceMaxCents;
    AND.push({ priceCents: range });
  }

  if (filters.minRating != null && filters.minRating > 0) {
    AND.push({ ratingAverage: { gte: filters.minRating } });
  }

  if (filters.inStockOnly) {
    AND.push({
      OR: [{ trackInventory: false }, { stockQuantity: { gt: 0 } }],
    });
  }

  if (filters.onSaleOnly) {
    AND.push({ discountPriceCents: { not: null } });
  }
  if (filters.trendingOnly) AND.push({ trending: true });
  if (filters.handmadeOnly) AND.push({ handmade: true });
  if (filters.featuredOnly) AND.push({ featured: true });
  if (filters.heroOnly) AND.push({ showInHero: true });
  if (filters.topRatedOnly) AND.push({ isTopRated: true });
  if (filters.comboOnly) AND.push({ isCombo: true });
  if (filters.boutiquePickOnly) AND.push({ boutiquePick: true });
  if (filters.newArrivalOnly) AND.push({ newArrival: true });
  if (filters.embroideryCollection) {
    AND.push({ category: "embroidery" });
  }
  if (filters.handmadeCollection) {
    AND.push({ handmade: true });
  }

  return AND.length === 0 ? {} : AND.length === 1 ? AND[0]! : { AND };
}
