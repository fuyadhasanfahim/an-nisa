import { z } from "zod";

/** Split comma/newline-separated tags from admin text input. */
export function parseTagsInput(input: string | undefined): string[] {
  if (!input?.trim()) return [];
  return [
    ...new Set(
      input
        .split(/[\n,]+/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 50)
    ),
  ];
}

export const productSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(1, "Slug is required"),
    sku: z
      .string()
      .trim()
      .min(1, "SKU is required")
      .max(80, "SKU must be at most 80 characters"),
    description: z.string().optional(),
    price: z.coerce.number().positive("Price must be greater than 0"),
    discountPrice: z.union([z.number(), z.string()]).nullish().transform(
      (v): number | undefined => {
        if (v === undefined || v === null || v === "") return undefined;
        const n =
          typeof v === "string" ? Number(v.trim()) : typeof v === "number" ? v : NaN;
        if (!Number.isFinite(n) || n <= 0) return undefined;
        return n;
      }
    ),
    images: z.array(z.string()).optional(),
    category: z.string().min(1, "Category is required"),
    status: z.enum(["active", "draft"]),
    stockQuantity: z.coerce
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
    trackInventory: z.boolean(),
    tagsText: z.string().optional(),
    brand: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
    sizesText: z.string().optional(),
    colorsText: z.string().optional(),
    fabricType: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
    embroideryType: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
    ratingAverage: z.coerce.number().min(0).max(5).default(0),
    ratingCount: z.coerce.number().int().min(0).default(0),
    showInHero: z.boolean().default(false),
    featured: z.boolean().default(false),
    isTopRated: z.boolean().default(false),
    isCombo: z.boolean().default(false),
    trending: z.boolean().default(false),
    handmade: z.boolean().default(false),
    boutiquePick: z.boolean().default(false),
    newArrival: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.discountPrice != null && Number.isFinite(v.discountPrice)) {
      if (v.discountPrice < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["discountPrice"],
          message: "Discount price cannot be negative",
        });
      }
      if (v.discountPrice >= v.price) {
        ctx.addIssue({
          code: "custom",
          path: ["discountPrice"],
          message: "Discount must be less than price",
        });
      }
    }
  });

export type ProductInput = z.infer<typeof productSchema>;

export const productPatchSchema = z.object({
  isActive: z.boolean(),
});

export type ProductPatchInput = z.infer<typeof productPatchSchema>;

/** API / persistence shape after expanding text fields to arrays. */
export type ProductPersistInput = Omit<
  ProductInput,
  "tagsText" | "sizesText" | "colorsText"
> & {
  tags: string[];
  sizes: string[];
  colors: string[];
};

export function productInputToPersist(input: ProductInput): ProductPersistInput {
  const {
    tagsText,
    sizesText,
    colorsText,
    ...rest
  } = input;
  return {
    ...rest,
    tags: parseTagsInput(tagsText),
    sizes: parseTagsInput(sizesText),
    colors: parseTagsInput(colorsText),
  };
}
