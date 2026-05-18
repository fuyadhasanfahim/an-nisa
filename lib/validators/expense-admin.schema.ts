import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const expenseCreateSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    amountCents: z
      .number()
      .int("Amount must be a whole number of cents")
      .positive("Amount must be greater than zero")
      .max(999_999_999_99),
    currency: z.string().trim().length(3).default("BDT"),
    category: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(80).optional(),
    ),
    description: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(2000).optional(),
    ),
    spentAt: z.string().datetime().optional(),
  })
  .strict();

export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;

export const expenseUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    amountCents: z
      .number()
      .int("Amount must be a whole number of cents")
      .positive("Amount must be greater than zero")
      .max(999_999_999_99)
      .optional(),
    currency: z.string().trim().length(3).optional(),
    category: z.union([z.string().trim().max(80), z.null()]).optional(),
    description: z.union([z.string().trim().max(2000), z.null()]).optional(),
    spentAt: z.string().datetime().optional(),
  })
  .strict()
  .refine((o) => Object.keys(o).length > 0, {
    message: "At least one field is required",
  });

export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
