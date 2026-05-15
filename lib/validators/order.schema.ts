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

/** How payment was collected (COD handover, trx channel, etc.). */
export const PAYMENT_COLLECTED_VIA = [
  "cash",
  "bkash",
  "nagad",
  "card",
  "bank_transfer",
  "other",
] as const;

export type PaymentCollectedVia = (typeof PAYMENT_COLLECTED_VIA)[number];

export const PAYMENT_COLLECTED_VIA_LABEL: Record<
  PaymentCollectedVia,
  string
> = {
  cash: "Cash",
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card",
  bank_transfer: "Bank transfer",
  other: "Other",
};

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
  paymentId: z
    .string()
    .trim()
    .min(1, "Payment ID / reference is required")
    .max(160),
  paymentCollectedVia: z.enum(PAYMENT_COLLECTED_VIA),
});

export type OrderWriteInput = z.infer<typeof orderWriteSchema>;

/**
 * Admin form shape (BDT decimals for discount/shipping). No `.transform()` here so
 * react-hook-form + zodResolver validate the same values the inputs hold.
 */
export const orderFormFieldsSchema = orderWriteSchema
  .omit({ discountCents: true, shippingFeeCents: true })
  .extend({
    discount: z.coerce.number().min(0).default(0),
    shippingFee: z.coerce.number().min(0).default(0),
  });

export type OrderFormValues = z.infer<typeof orderFormFieldsSchema>;

/** Initial values for reset() on edit — same shape as the form. */
export type OrderFormInput = OrderFormValues;

export function orderFormValuesToWriteInput(v: OrderFormValues): OrderWriteInput {
  const { discount, shippingFee, ...rest } = v;
  return {
    ...rest,
    discountCents: Math.round(discount * 100),
    shippingFeeCents: Math.round(shippingFee * 100),
  };
}

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

export function normalizePaymentCollectedVia(
  value: string
): PaymentCollectedVia {
  return (PAYMENT_COLLECTED_VIA as readonly string[]).includes(value)
    ? (value as PaymentCollectedVia)
    : "cash";
}

/** Inline admin edits: order pipeline status and/or payment (Paid vs Unpaid). */
export const orderPatchSchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(["pending", "paid"]).optional(),
  })
  .refine((v) => v.status !== undefined || v.paymentStatus !== undefined, {
    message: "Provide status and/or paymentStatus",
  });

export type OrderPatchInput = z.infer<typeof orderPatchSchema>;
