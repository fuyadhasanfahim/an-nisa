"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validators/product.schema";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/store/api/productsApi";
import { useToast } from "@/components/shared/toast/useToast";
import { motion } from "framer-motion";
import {
  IconCircleCheckFilled,
  IconCircleDotted,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-brand-black">{label}</label>
        {hint ? <div className="text-xs text-black/45">{hint}</div> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-11 w-full rounded-xl bg-white px-3 text-sm text-brand-black",
        "shadow-sm ring-1 ring-black/5 transition",
        "placeholder:text-black/40",
        "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-[110px] w-full resize-y rounded-xl bg-white px-3 py-2 text-sm text-brand-black",
        "shadow-sm ring-1 ring-black/5 transition",
        "placeholder:text-black/40",
        "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "h-11 w-full rounded-xl bg-white px-3 text-sm text-brand-black",
        "shadow-sm ring-1 ring-black/5 transition",
        "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function Button({
  variant = "primary",
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-pink/40 disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-[#0b0b0f] text-white shadow-sm hover:shadow-softSm"
      : "bg-white text-brand-black ring-1 ring-black/10 hover:bg-black/5";
  return (
    <motion.button
      whileHover={props.disabled ? undefined : { scale: 1.02 }}
      whileTap={props.disabled ? undefined : { scale: 0.98 }}
      {...props}
      className={[base, styles, props.className ?? ""].join(" ")}
    >
      {loading ? "Saving…" : props.children}
    </motion.button>
  );
}

function Switch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-9 w-16 items-center rounded-full p-1 transition",
        "shadow-sm ring-1 ring-black/10",
        checked ? "bg-[#fcc4c8]/70" : "bg-white",
        disabled ? "opacity-60" : "hover:shadow-softSm",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "h-7 w-7 rounded-full bg-white shadow-sm transition",
          checked ? "translate-x-7" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

export function ProductForm({
  productId,
  initialValues,
}: {
  productId?: string;
  initialValues?: ProductInput;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isSaving = isCreating || isUpdating;
  const [uploading, setUploading] = useState(false);

  const isEdit = !!productId;
  const slugEditedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      discountPrice: undefined,
      images: [],
      category: "embroidery",
      status: "active",
    },
    mode: "onBlur",
  });

  const normalizedInitial = useMemo(() => initialValues, [initialValues]);
  useEffect(() => {
    if (!normalizedInitial) return;
    reset(normalizedInitial);
    // In edit mode, never auto-overwrite the existing slug.
    slugEditedRef.current = true;
  }, [normalizedInitial, reset]);

  const name = watch("name");
  const status = watch("status");
  const images = watch("images") ?? [];

  useEffect(() => {
    if (isEdit) return;
    if (slugEditedRef.current) return;
    const next = slugify(name ?? "");
    setValue("slug", next, { shouldValidate: false, shouldDirty: true });
  }, [isEdit, name, setValue]);

  async function onSubmit(values: ProductInput) {
    try {
      if (productId) {
        await updateProduct({ id: productId, data: values }).unwrap();
        toast({
          title: "Product updated",
          message: "Your changes have been saved.",
          variant: "success",
        });
      } else {
        await createProduct(values).unwrap();
        toast({
          title: "Product created",
          message: "Your product has been added to the catalog.",
          variant: "success",
        });
      }
      router.push("/admin/products");
      router.refresh();
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "data" in e
          ? (e as { data?: { error?: string; message?: string } }).data?.error ??
            (e as { data?: { error?: string; message?: string } }).data?.message
          : undefined;
      toast({
        title: productId ? "Couldn’t update product" : "Couldn’t create product",
        message: msg ?? "Something went wrong. Please try again.",
        variant: "error",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="text-xs font-medium tracking-wide text-black/45">
            Basic info
          </div>
          <Field label="Product Name" error={errors.name?.message}>
            <Input placeholder="Premium Floral Abaya Embroidery" {...register("name")} />
          </Field>

          <Field
            label="Slug"
            hint="Auto-generated, editable"
            error={errors.slug?.message}
          >
            <Input
              placeholder="premium-floral-abaya-embroidery"
              {...register("slug", {
                onChange: () => {
                  slugEditedRef.current = true;
                },
              })}
            />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <Textarea
              placeholder="A short, elegant description (optional)…"
              {...register("description")}
            />
          </Field>
        </div>

        <div className="space-y-5">
          <div className="text-xs font-medium tracking-wide text-black/45">
            Pricing
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price" error={errors.price?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="120.00"
                {...register("price")}
              />
            </Field>
            <Field label="Discount Price" error={errors.discountPrice?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="99.00"
                {...register("discountPrice")}
              />
            </Field>
          </div>

          <div className="text-xs font-medium tracking-wide text-black/45">
            Category & status
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" error={errors.category?.message}>
              <Select {...register("category")}>
                <option value="embroidery">Embroidery</option>
                <option value="abaya">Abaya</option>
                <option value="custom">Custom</option>
                <option value="accessories">Accessories</option>
              </Select>
            </Field>

            <div className="space-y-1.5">
              <div className="text-sm font-medium text-brand-black">Status</div>
              <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2 text-sm text-black/70">
                  {status === "active" ? (
                    <IconCircleCheckFilled className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <IconCircleDotted className="h-5 w-5 text-black/40" />
                  )}
                  <span className="font-medium">
                    {status === "active" ? "Active" : "Draft"}
                  </span>
                </div>
                <Switch
                  checked={status === "active"}
                  onChange={(v) => setValue("status", v ? "active" : "draft")}
                  disabled={isSaving}
                />
              </div>
              {errors.status?.message ? (
                <p className="text-xs text-rose-600">{errors.status?.message}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="text-xs font-medium tracking-wide text-black/45">Media</div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div>
            <div className="text-sm font-medium text-brand-black">Images</div>
            <div className="mt-1 text-xs text-black/55">
              Drag & drop to upload. Images are uploaded to Cloudinary and saved as URLs.
            </div>
          </div>

          <div className="mt-4">
            <ImageUpload
              value={images}
              onChange={(urls) => setValue("images", urls, { shouldDirty: true })}
              onUploadingChange={setUploading}
              disabled={isSaving}
              maxFiles={8}
              onError={(msg) =>
                toast({ title: "Upload failed", message: msg, variant: "error" })
              }
            />
            {errors.images?.message ? (
              <p className="mt-2 text-xs text-rose-600">{errors.images.message}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSaving}
          disabled={isSaving || uploading}
        >
          {productId ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

