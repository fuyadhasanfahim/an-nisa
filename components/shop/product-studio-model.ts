export type BoutiqueProductStudioModel = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  discountPriceCents: number | null;
  effectivePriceCents: number;
  currency: string;
  images: string[];
  fabricType?: string | null;
  embroideryType?: string | null;
  category: string;
  sizes: string[];
  colors?: string[];
  ratingAverage?: number;
  ratingCount?: number;
};
