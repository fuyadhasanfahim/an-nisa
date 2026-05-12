"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  orderFormFieldsSchema,
  orderFormValuesToWriteInput,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_COLLECTED_VIA,
  PAYMENT_COLLECTED_VIA_LABEL,
  type OrderFormInput,
  type OrderFormValues,
} from "@/lib/validators/order.schema";
import {
  useCreateOrderMutation,
  useUpdateOrderMutation,
} from "@/store/api/ordersApi";
import { useListProductsQuery } from "@/store/api/productsApi";
import { useLazyListUsersForAdminQuery } from "@/store/api/usersApi";
import type { UserMiniDto } from "@/store/api/usersApi";
import { useToast } from "@/components/shared/toast/useToast";
import { useRouter } from "next/navigation";
import {
  Field,
  FormSection,
  FormActions,
  AdminFormButton,
  Input,
  FormSelect,
  FormTextarea,
} from "@/components/admin/form";
import { IconPlus, IconTrash, IconUserSearch } from "@tabler/icons-react";
import { finalizeOrderTotals } from "@/lib/orders/compute-order-totals";
import { useLazyGetCustomerProfileForAdminQuery } from "@/store/api/usersApi";

const PAYMENT_LABEL: Record<(typeof PAYMENT_METHODS)[number], string> = {
  cod: "Cash on delivery",
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card",
  bank_transfer: "Bank transfer",
  other: "Other",
};

function UserPicker({
  selectedUser,
  onSelect,
  error,
}: {
  selectedUser: UserMiniDto | null;
  onSelect: (u: UserMiniDto) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [trigger, { data, isFetching }] = useLazyListUsersForAdminQuery();

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(q.trim()), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!open) return;
    void trigger({ q: search || undefined, limit: 30 });
  }, [open, search, trigger]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const items = data?.items ?? [];

  return (
    <div ref={rootRef} className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-brand-black">Customer</label>
      </div>

      {selectedUser?.id ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-black/5">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-brand-black">
              {selectedUser.name}
            </div>
            <div className="truncate text-xs text-black/55">{selectedUser.email}</div>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-black/60 underline-offset-2 transition hover:text-brand-black hover:underline"
            onClick={() => {
              onSelect({ id: "", name: "", email: "" });
              setOpen(true);
              setQ("");
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <IconUserSearch
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35"
              stroke={2}
            />
            <Input
              className="pl-10"
              placeholder="Search by name or email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setOpen(true)}
              autoComplete="off"
            />
          </div>
          {open ? (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-black/10 bg-white py-1 shadow-lg">
              {isFetching ? (
                <div className="px-3 py-2 text-xs text-black/55">Searching…</div>
              ) : items.length === 0 ? (
                <div className="px-3 py-2 text-xs text-black/55">No users found.</div>
              ) : (
                items.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition hover:bg-black/3"
                    onClick={() => {
                      onSelect(u);
                      setOpen(false);
                      setQ("");
                    }}
                  >
                    <span className="font-medium text-brand-black">{u.name}</span>
                    <span className="text-xs text-black/55">{u.email}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      )}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function OrderForm({
  orderId,
  initialValues,
  initialCustomer,
}: {
  orderId?: string;
  initialValues?: OrderFormInput;
  initialCustomer?: UserMiniDto | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const isSaving = isCreating || isUpdating;
  const [triggerCustomerProfile] = useLazyGetCustomerProfileForAdminQuery();

  const { data: productsData } = useListProductsQuery({
    q: "",
    sort: "createdAt",
    order: "desc",
    page: 1,
    limit: 100,
  });

  const productOptions = useMemo(
    () => productsData?.items.filter((p) => p.isActive) ?? [],
    [productsData?.items]
  );

  const [selectedUser, setSelectedUser] = useState<UserMiniDto | null>(
    initialCustomer ?? null
  );
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormFieldsSchema) as Resolver<OrderFormValues>,
    defaultValues: {
      userId: "",
      status: "pending",
      items: [{ productId: "", quantity: 1 }],
      shippingPhone: "",
      shippingAddress: "",
      shippingCity: "",
      shippingCountry: "BD",
      discount: 0,
      shippingFee: 0,
      paymentMethod: "cod",
      paymentStatus: "pending",
      paymentId: "",
      paymentCollectedVia: "cash",
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
    defaultValue: [{ productId: "", quantity: 1 }],
  });
  const watchedDiscount = useWatch({ control, name: "discount", defaultValue: 0 });
  const watchedShippingFee = useWatch({
    control,
    name: "shippingFee",
    defaultValue: 0,
  });

  const lineTotalsForPreview = useMemo(() => {
    const priceById = new Map(
      productOptions.map((p) => [p.id, p.priceCents] as const)
    );
    const lines: { unitCents: number; quantity: number }[] = [];
    for (const line of watchedItems ?? []) {
      const pid = line.productId;
      if (!pid) continue;
      const unit = priceById.get(pid);
      if (unit == null) continue;
      const qty = Number(line.quantity);
      if (!Number.isFinite(qty) || qty < 1) continue;
      lines.push({ unitCents: unit, quantity: qty });
    }
    return lines;
  }, [watchedItems, productOptions]);

  const previewTotals = useMemo(() => {
    const disc = Number(watchedDiscount);
    const ship = Number(watchedShippingFee);
    return finalizeOrderTotals({
      lines: lineTotalsForPreview,
      discountCents: Math.round((Number.isFinite(disc) ? disc : 0) * 100),
      shippingFeeCents: Math.round((Number.isFinite(ship) ? ship : 0) * 100),
    });
  }, [lineTotalsForPreview, watchedDiscount, watchedShippingFee]);

  const normalizedInitial = useMemo(
    () => initialValues,
    [initialValues]
  );

  useEffect(() => {
    if (!normalizedInitial) return;
    reset(normalizedInitial);
  }, [normalizedInitial, reset]);

  useEffect(() => {
    if (!initialCustomer) return;
    startTransition(() => {
      setSelectedUser(initialCustomer);
    });
  }, [initialCustomer, startTransition]);

  const onSelectUser = useCallback(
    (u: UserMiniDto) => {
      if (!u.id) {
        setValue("userId", "", { shouldValidate: true, shouldDirty: true });
        setSelectedUser(null);
        return;
      }
      setValue("userId", u.id, { shouldValidate: true, shouldDirty: true });
      setSelectedUser(u);

      if (!orderId) {
        void triggerCustomerProfile(u.id)
          .unwrap()
          .then((profile) => {
            if (profile.phone)
              setValue("shippingPhone", profile.phone, { shouldDirty: true });
            if (profile.address)
              setValue("shippingAddress", profile.address, { shouldDirty: true });
            if (profile.city)
              setValue("shippingCity", profile.city, { shouldDirty: true });
            if (profile.country)
              setValue("shippingCountry", profile.country, { shouldDirty: true });
          })
          .catch(() => {
            /* no profile */
          });
      }
    },
    [orderId, setValue, triggerCustomerProfile]
  );

  async function onSubmit(values: OrderFormValues) {
    const payload = orderFormValuesToWriteInput(values);
    try {
      if (orderId) {
        await updateOrder({ id: orderId, data: payload }).unwrap();
        toast({
          title: "Order updated",
          message: "Changes have been saved.",
          variant: "success",
        });
      } else {
        await createOrder(payload).unwrap();
        toast({
          title: "Order created",
          message: "The order has been added.",
          variant: "success",
        });
      }
      router.push("/admin/orders");
      router.refresh();
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "data" in e
          ? String((e as { data?: { error?: string } }).data?.error ?? "")
          : "";
      toast({
        title: orderId ? "Couldn’t update order" : "Couldn’t create order",
        message: msg || "Something went wrong. Try again.",
        variant: "error",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-x-12 lg:gap-y-0">
        <FormSection
          title="Customer & status"
          description="Search registered customers, then set how this order should appear in your pipeline."
        >
          <input type="hidden" {...register("userId")} />
          <UserPicker
            selectedUser={selectedUser}
            onSelect={onSelectUser}
            error={errors.userId?.message}
          />
          <Field label="Order status" error={errors.status?.message}>
            <FormSelect {...register("status")}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </FormSelect>
          </Field>
        </FormSection>

        <FormSection
          title="Summary"
          description="Subtotal follows selected products. Discount cannot exceed subtotal."
        >
          <div className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
            <Field label="Discount (৳)" error={errors.discount?.message}>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...register("discount", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Shipping fee (৳)" error={errors.shippingFee?.message}>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...register("shippingFee", { valueAsNumber: true })}
              />
            </Field>
          </div>
          <div className="space-y-3 rounded-xl bg-white p-4 text-sm text-black/70 shadow-sm ring-1 ring-black/5">
            <p className="text-xs leading-relaxed text-black/55">
              Unit prices snap to the catalog when you save. This preview uses current
              list prices.
            </p>
            <div className="space-y-2 border-t border-black/10 pt-3">
              <div className="flex justify-between gap-3 tabular-nums">
                <span className="text-black/55">Subtotal</span>
                <span>৳ {(previewTotals.subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-3 tabular-nums">
                <span className="text-black/55">Discount</span>
                <span>− ৳ {(previewTotals.discountCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-3 tabular-nums">
                <span className="text-black/55">Shipping</span>
                <span>৳ {(previewTotals.shippingFeeCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-black/10 pt-2 text-base font-semibold text-brand-black tabular-nums">
                <span>Total (preview)</span>
                <span>৳ {(previewTotals.totalCents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      <FormSection
        title="Delivery"
        description="Saved on the order so changes to the customer profile do not rewrite history."
      >
        <Field label="Phone" hint="Optional" error={errors.shippingPhone?.message}>
          <Input
            type="tel"
            placeholder="+880…"
            autoComplete="tel"
            {...register("shippingPhone")}
          />
        </Field>
        <Field label="Address" error={errors.shippingAddress?.message}>
          <FormTextarea
            rows={3}
            placeholder="Street, area, postcode…"
            {...register("shippingAddress")}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
          <Field label="City" error={errors.shippingCity?.message}>
            <Input {...register("shippingCity")} />
          </Field>
          <Field label="Country (ISO)" error={errors.shippingCountry?.message}>
            <Input maxLength={2} className="uppercase" {...register("shippingCountry")} />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Payment"
        description="Order payment method and status. For COD collection, enter the payment reference and how it was received."
      >
        <div className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
          <Field label="Method" error={errors.paymentMethod?.message}>
            <FormSelect {...register("paymentMethod")}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_LABEL[m]}
                </option>
              ))}
            </FormSelect>
          </Field>
          <Field label="Payment status" error={errors.paymentStatus?.message}>
            <FormSelect {...register("paymentStatus")}>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </FormSelect>
          </Field>
        </div>
        <Field
          label="Payment ID"
          hint="Trx / receipt / reference — required"
          error={errors.paymentId?.message}
        >
          <Input
            placeholder="e.g. TRXABC123456 or receipt number"
            autoComplete="off"
            {...register("paymentId")}
          />
        </Field>
        <Field
          label="Received via"
          hint="How the customer paid"
          error={errors.paymentCollectedVia?.message}
        >
          <FormSelect {...register("paymentCollectedVia")}>
            {PAYMENT_COLLECTED_VIA.map((v) => (
              <option key={v} value={v}>
                {PAYMENT_COLLECTED_VIA_LABEL[v]}
              </option>
            ))}
          </FormSelect>
        </Field>
      </FormSection>

      <FormSection
        title="Line items"
        description="Add one row per product. Rows without a product are ignored when calculating the preview."
      >
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-brand-black ring-1 ring-black/10 transition hover:bg-black/5"
            onClick={() => append({ productId: "", quantity: 1 })}
          >
            <IconPlus className="h-4 w-4" stroke={2} />
            Add line
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid min-w-0 gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:grid-cols-[minmax(0,1fr)_120px_auto] sm:items-stretch"
            >
              <Field
                label="Product"
                error={errors.items?.[index]?.productId?.message}
              >
                <FormSelect {...register(`items.${index}.productId`)}>
                  <option value="">Select product…</option>
                  {productOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ৳ {(p.priceCents / 100).toFixed(2)}
                    </option>
                  ))}
                </FormSelect>
              </Field>
              <Field
                label="Qty"
                error={errors.items?.[index]?.quantity?.message}
              >
                <Input
                  type="number"
                  min={1}
                  step={1}
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                />
              </Field>
              <div className="flex items-end justify-end sm:pb-1">
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-xl text-black/55 ring-1 ring-black/10 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                  aria-label="Remove line"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                >
                  <IconTrash className="h-4 w-4" stroke={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {errors.items?.message ? (
          <p className="text-xs text-rose-600">{String(errors.items.message)}</p>
        ) : null}
        {typeof errors.items?.root?.message === "string" ? (
          <p className="text-xs text-rose-600">{errors.items.root.message}</p>
        ) : null}
      </FormSection>

      <FormActions>
        <AdminFormButton
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/orders")}
          disabled={isSaving}
        >
          Cancel
        </AdminFormButton>
        <AdminFormButton type="submit" loading={isSaving} disabled={isSaving}>
          {orderId ? "Update order" : "Create order"}
        </AdminFormButton>
      </FormActions>
    </form>
  );
}
