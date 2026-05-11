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

export const PAYMENT_METHODS = [
  "cod",
  "bkash",
  "nagad",
  "card",
  "bank_transfer",
  "other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

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
  shippingPhone: z.preprocess(
    emptyToUndefined,
    z.string().max(40).optional()
  ),
  shippingAddress: z
    .string()
    .trim()
    .min(1, "Delivery address is required")
    .max(2000),
  shippingCity: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(120),
  shippingCountry: z
    .string()
    .trim()
    .min(2, "Country code is required")
    .max(2)
    .default("BD"),
  discountCents: z.coerce
    .number()
    .int("Discount must be a whole number of cents")
    .min(0)
    .default(0),
  shippingFeeCents: z.coerce
    .number()
    .int("Shipping fee must be a whole number of cents")
    .min(0)
    .default(0),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cod"),
  paymentStatus: z.enum(PAYMENT_STATUSES).default("pending"),
});

export type OrderWriteInput = z.infer<typeof orderWriteSchema>;

/** Admin form: discount & shipping in BDT (decimal); transforms to cents for API. */
export const orderFormSchema = orderWriteSchema
  .omit({ discountCents: true, shippingFeeCents: true })
  .extend({
    discount: z.coerce.number().min(0).default(0),
    shippingFee: z.coerce.number().min(0).default(0),
  })
  .transform((v) => {
    const { discount, shippingFee, ...rest } = v;
    return {
      ...rest,
      discountCents: Math.round(discount * 100),
      shippingFeeCents: Math.round(shippingFee * 100),
    };
  });

export type OrderFormInput = z.input<typeof orderFormSchema>;

export function normalizePaymentMethod(value: string): PaymentMethod {
  return (PAYMENT_METHODS as readonly string[]).includes(value)
    ? (value as PaymentMethod)
    : "cod";
}

export function normalizePaymentStatus(value: string): PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value)
    ? (value as PaymentStatus)
    : "pending";
}

export const orderPatchSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type OrderPatchInput = z.infer<typeof orderPatchSchema>;
