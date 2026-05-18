import { z } from "zod";
import {
  PAYMENT_COLLECTED_VIA,
  PAYMENT_METHODS,
} from "@/lib/validators/order.schema";

export const checkoutLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1"),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutLineSchema).min(1, "Cart cannot be empty"),
  shippingPhone: z.string().trim().max(40).optional().nullable(),
  shippingAddress: z
    .string()
    .trim()
    .min(1, "Delivery address is required")
    .max(2000),
  shippingCity: z.string().trim().min(1, "City is required").max(120),
  shippingCountry: z
    .string()
    .trim()
    .min(2)
    .max(2)
    .default("BD"),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cod"),
  paymentId: z.string().trim().max(160).optional().nullable(),
  paymentCollectedVia: z.enum(PAYMENT_COLLECTED_VIA).default("cash"),
  discount: z.coerce.number().min(0).default(0),
  shippingFee: z.coerce.number().min(0).default(0),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
