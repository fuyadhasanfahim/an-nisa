"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  adminCustomerCreateSchema,
  type AdminCustomerCreateInput,
} from "@/lib/validators/customer-admin.schema";
import {
  Field,
  FormSection,
  FormActions,
  AdminFormButton,
  Input,
  FormTextarea,
} from "@/components/admin/form";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerAdminQuery,
} from "@/store/api/usersApi";
import { useToast } from "@/components/shared/toast/useToast";
import { IconX } from "@tabler/icons-react";
import { skipToken } from "@reduxjs/toolkit/query";

const defaults: AdminCustomerCreateInput = {
  name: "",
  email: "",
  phone: undefined,
  address: undefined,
  city: undefined,
  country: "BD",
};

export function CustomerModal({
  open,
  onOpenChange,
  customerId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  customerId: string | null;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const isEdit = customerId !== null;

  const { data: existing, isFetching } = useGetCustomerAdminQuery(
    open && customerId ? customerId : skipToken,
  );

  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminCustomerCreateInput>({
    resolver: zodResolver(
      adminCustomerCreateSchema,
    ) as Resolver<AdminCustomerCreateInput>,
    defaultValues: defaults,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      reset(defaults);
      return;
    }
    if (!existing) return;
    reset({
      name: existing.name,
      email: existing.email,
      phone: existing.phone ?? undefined,
      address: existing.address ?? undefined,
      city: existing.city ?? undefined,
      country: existing.country ?? "BD",
    });
  }, [open, isEdit, existing, reset]);

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

  const saving = isCreating || isUpdating || (isEdit && isFetching);

  const onSubmit = useCallback(
    async (values: AdminCustomerCreateInput) => {
      try {
        if (isEdit && customerId) {
          await updateCustomer({
            id: customerId,
            body: {
              name: values.name,
              email: values.email,
              phone: values.phone,
              address: values.address,
              city: values.city,
              country: values.country,
            },
          }).unwrap();
          toast({
            title: "Customer updated",
            message: "Saved changes.",
            variant: "success",
          });
        } else {
          await createCustomer(values).unwrap();
          toast({
            title: "Customer added",
            message: "They can sign in with Google using this email.",
            variant: "success",
          });
        }
        onOpenChange(false);
      } catch (e: unknown) {
        const msg =
          typeof e === "object" && e && "data" in e
            ? String((e as { data?: { error?: string } }).data?.error ?? "")
            : "";
        toast({
          title: isEdit ? "Couldn’t save customer" : "Couldn’t add customer",
          message: msg || "Something went wrong.",
          variant: "error",
        });
      }
    },
    [
      createCustomer,
      customerId,
      isEdit,
      onOpenChange,
      toast,
      updateCustomer,
    ],
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
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-brand-black">
              {isEdit ? "Edit customer" : "Add customer"}
            </h2>
            <p className="mt-1 text-sm text-black/55">
              {isEdit
                ? "Update profile details. Use Ban in the table to block sign-in."
                : "Creates an account record. They still sign in with Google using this email."}
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
            title="Account"
            description="Use the email they will use with Google sign-in."
          >
            <Field label="Name" error={errors.name?.message}>
              <Input {...register("name")} autoComplete="name" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...register("email")} autoComplete="email" />
            </Field>
          </FormSection>

          <FormSection
            title="Profile"
            description="Optional defaults for shipping on new orders."
          >
            <Field label="Phone" hint="Optional" error={errors.phone?.message}>
              <Input type="tel" {...register("phone")} autoComplete="tel" />
            </Field>
            <Field label="City" error={errors.city?.message}>
              <Input {...register("city")} autoComplete="address-level2" />
            </Field>
            <Field label="Country (ISO)" error={errors.country?.message}>
              <Input
                maxLength={2}
                className="uppercase"
                {...register("country")}
              />
            </Field>
            <Field label="Address" error={errors.address?.message}>
              <FormTextarea rows={3} {...register("address")} />
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
              {isEdit ? "Save changes" : "Add customer"}
            </AdminFormButton>
          </FormActions>
        </form>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
