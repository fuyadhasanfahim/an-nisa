"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  orderWriteSchema,
  ORDER_STATUSES,
  type OrderWriteInput,
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
  Input,
  FormSelect,
  Button,
} from "@/components/admin/form";
import { IconPlus, IconTrash, IconUserSearch } from "@tabler/icons-react";

type OrderFormValues = OrderWriteInput;

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
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition hover:bg-black/[0.03]"
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
  initialValues?: OrderFormValues;
  initialCustomer?: UserMiniDto | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const isSaving = isCreating || isUpdating;

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
    resolver: zodResolver(orderWriteSchema) as Resolver<OrderFormValues>,
    defaultValues: {
      userId: "",
      status: "pending",
      items: [{ productId: "", quantity: 1 }],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

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
    },
    [setValue]
  );

  async function onSubmit(values: OrderFormValues) {
    try {
      if (orderId) {
        await updateOrder({ id: orderId, data: values }).unwrap();
        toast({
          title: "Order updated",
          message: "Changes have been saved.",
          variant: "success",
        });
      } else {
        await createOrder(values).unwrap();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="text-xs font-medium tracking-wide text-black/45">
            Customer & status
          </div>
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
        </div>

        <div className="space-y-5">
          <div className="text-xs font-medium tracking-wide text-black/45">
            Summary
          </div>
          <div className="rounded-xl bg-white p-4 text-sm text-black/70 shadow-sm ring-1 ring-black/5">
            Line totals use each product&apos;s current catalog price in BDT. Saving
            the order snapshots unit prices at that moment.
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="text-xs font-medium tracking-wide text-black/45">
            Line items
          </div>
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
              className="grid gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:grid-cols-[1fr_120px_auto]"
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
                  {...register(`items.${index}.quantity`)}
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
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/orders")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSaving} disabled={isSaving}>
          {orderId ? "Update order" : "Create order"}
        </Button>
      </div>
    </form>
  );
}
