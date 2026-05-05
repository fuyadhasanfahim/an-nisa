import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    price: z.coerce.number().positive("Price must be greater than 0"),
    discountPrice: z.coerce.number().optional(),
    images: z.array(z.string()).optional(),
    category: z.string().min(1, "Category is required"),
    status: z.enum(["active", "draft"]),
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

