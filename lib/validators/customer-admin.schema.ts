import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const adminCustomerCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email required").max(254),
  phone: z.preprocess(emptyToUndefined, z.string().max(40).optional()),
  address: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  city: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  country: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code")
    .default("BD"),
});

export type AdminCustomerCreateInput = z.infer<typeof adminCustomerCreateSchema>;

export const adminCustomerUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().max(254).optional(),
    phone: z.preprocess(emptyToUndefined, z.string().max(40).optional()),
    address: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
    city: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
    country: z.preprocess(emptyToUndefined, z.string().trim().length(2).optional()),
    banned: z.boolean().optional(),
  })
  .strict();

export type AdminCustomerUpdateInput = z.infer<typeof adminCustomerUpdateSchema>;
