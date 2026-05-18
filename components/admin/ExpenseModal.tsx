"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FormSection,
  FormActions,
  AdminFormButton,
  Input,
  FormTextarea,
} from "@/components/admin/form";
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from "@/store/api/expensesApi";
import type { ExpenseTransactionRow } from "@/store/api/expensesApi";
import { useToast } from "@/components/shared/toast/useToast";
import { IconX } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const expenseFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((s) => {
      const n = Number(String(s).replace(/,/g, ""));
      return Number.isFinite(n) && n > 0;
    }, "Enter a valid amount"),
  category: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(2000).optional(),
  ),
  spentDate: z.string().min(1, "Date is required"),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

const defaults: ExpenseFormValues = {
  title: "",
  amount: "",
  category: undefined,
  description: undefined,
  spentDate: format(new Date(), "yyyy-MM-dd"),
};

function amountMajorFromCents(cents: number) {
  return (Math.round(cents) / 100).toFixed(2);
}

export function ExpenseModal({
  open,
  onOpenChange,
  expenseToEdit = null,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  expenseToEdit?: ExpenseTransactionRow | null;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const isEdit = expenseToEdit !== null;
  const saving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as Resolver<ExpenseFormValues>,
    defaultValues: defaults,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    if (expenseToEdit) {
      reset({
        title: expenseToEdit.title,
        amount: amountMajorFromCents(expenseToEdit.amountCents),
        category: expenseToEdit.category?.trim() || undefined,
        description: expenseToEdit.description?.trim() || undefined,
        spentDate: format(parseISO(expenseToEdit.spentAt), "yyyy-MM-dd"),
      });
    } else {
      reset({
        ...defaults,
        spentDate: format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [open, expenseToEdit, reset]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const onSubmit = useCallback(
    async (values: ExpenseFormValues) => {
      const major = Number(String(values.amount).replace(/,/g, ""));
      const amountCents = Math.round(major * 100);
      if (!Number.isFinite(amountCents) || amountCents < 1) {
        toast({
          title: "Invalid amount",
          message: "Enter a positive amount.",
          variant: "error",
        });
        return;
      }
      const spentAt = new Date(`${values.spentDate}T12:00:00`);
      const categoryTrim = values.category?.trim();
      const descTrim = values.description?.trim();

      try {
        if (isEdit && expenseToEdit) {
          await updateExpense({
            id: expenseToEdit.id,
            body: {
              title: values.title,
              amountCents,
              currency: "BDT",
              category: categoryTrim ? categoryTrim : null,
              description: descTrim ? descTrim : null,
              spentAt: spentAt.toISOString(),
            },
          }).unwrap();
          toast({
            title: "Expense updated",
            message: "Saved changes.",
            variant: "success",
          });
        } else {
          await createExpense({
            title: values.title,
            amountCents,
            currency: "BDT",
            category: categoryTrim,
            description: descTrim,
            spentAt: spentAt.toISOString(),
          }).unwrap();
          toast({
            title: "Expense recorded",
            message: "It appears in your ledger below.",
            variant: "success",
          });
        }
        onOpenChange(false);
      } catch (e: unknown) {
        const msg =
          typeof e === "object" && e && "data" in e
            ? String((e as { data?: { error?: unknown } }).data?.error ?? "")
            : "";
        toast({
          title: isEdit ? "Couldn’t save changes" : "Couldn’t save expense",
          message: msg || "Something went wrong.",
          variant: "error",
        });
      }
    },
    [createExpense, expenseToEdit, isEdit, onOpenChange, toast, updateExpense],
  );

  if (!mounted || !open) return null;

  const body = (
    <div className="fixed inset-0 z-[205] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/45"
        onClick={() => !saving && onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-brand-black">
              {isEdit ? "Edit expense" : "Add expense"}
            </h2>
            <p className="mt-1 text-sm text-black/55">
              {isEdit
                ? "Update this row; charts use the spent date."
                : "Track outgoing costs; totals roll into charts using the spent date."}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            disabled={saving}
            className="rounded-xl p-2 text-black/50 transition hover:bg-black/5 hover:text-brand-black"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <IconX className="h-5 w-5" stroke={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
          <FormSection
            title="Expense"
            description="Enter the amount in taka (৳); we store it precisely as cents."
          >
            <Field label="Title" error={errors.title?.message}>
              <Input {...register("title")} placeholder="e.g. Thread wholesale" />
            </Field>
            <Field label="Amount (৳)" error={errors.amount?.message}>
              <Input
                {...register("amount")}
                inputMode="decimal"
                placeholder="0.00"
                autoComplete="off"
              />
            </Field>
            <Field label="Spent on" error={errors.spentDate?.message}>
              <Input type="date" {...register("spentDate")} />
            </Field>
            <Field label="Category" hint="Optional" error={errors.category?.message}>
              <Input {...register("category")} placeholder="Rent, shipping…" />
            </Field>
            <Field label="Notes" hint="Optional" error={errors.description?.message}>
              <FormTextarea rows={3} {...register("description")} />
            </Field>
          </FormSection>

          <FormActions>
            <AdminFormButton
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </AdminFormButton>
            <AdminFormButton type="submit" loading={saving} disabled={saving}>
              {isEdit ? "Save changes" : "Save expense"}
            </AdminFormButton>
          </FormActions>
        </form>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
