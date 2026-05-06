import { z } from "zod";

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

