import { z } from "zod";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1"),
});

export const orderWriteSchema = z.object({
  userId: z.string().min(1, "Customer is required"),
  status: z.enum(ORDER_STATUSES).default("pending"),
  items: z
    .array(orderItemInputSchema)
    .min(1, "Add at least one line item"),
});

export type OrderWriteInput = z.infer<typeof orderWriteSchema>;

export const orderPatchSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type OrderPatchInput = z.infer<typeof orderPatchSchema>;
