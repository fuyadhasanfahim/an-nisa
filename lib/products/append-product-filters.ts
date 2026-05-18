import type { ProductListFilters } from "@/lib/validators/product-list.query";

function setBool(sp: URLSearchParams, key: string, v?: boolean) {
  if (v === undefined) return;
  sp.set(key, v ? "true" : "false");
}

export function appendProductFilters(
  sp: URLSearchParams,
  f: Partial<ProductListFilters>
) {
  if (f.category) sp.set("category", f.category);
  if (f.priceMinCents != null) sp.set("priceMin", String(f.priceMinCents));
  if (f.priceMaxCents != null) sp.set("priceMax", String(f.priceMaxCents));
  if (f.size) sp.set("size", f.size);
  if (f.color) sp.set("color", f.color);
  if (f.fabricType) sp.set("fabric", f.fabricType);
  if (f.embroideryType) sp.set("embroidery", f.embroideryType);
  if (f.minRating != null) sp.set("minRating", String(f.minRating));
  setBool(sp, "inStock", f.inStockOnly);
  if (f.brand) sp.set("brand", f.brand);
  setBool(sp, "onSale", f.onSaleOnly);
  setBool(sp, "trending", f.trendingOnly);
  setBool(sp, "handmade", f.handmadeOnly);
  setBool(sp, "featured", f.featuredOnly);
  setBool(sp, "includeInactive", f.includeInactive);
  setBool(sp, "hero", f.heroOnly);
  setBool(sp, "topRated", f.topRatedOnly);
  setBool(sp, "combo", f.comboOnly);
  setBool(sp, "boutique", f.boutiquePickOnly);
  setBool(sp, "newArrival", f.newArrivalOnly);
  setBool(sp, "embroideryCollection", f.embroideryCollection);
  setBool(sp, "handmadeCollection", f.handmadeCollection);
}
