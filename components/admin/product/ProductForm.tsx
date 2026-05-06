"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validators/product.schema";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/store/api/productsApi";
import { useToast } from "@/components/shared/toast/useToast";
import {
  IconCircleCheckFilled,
  IconCircleDotted,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  AdminFormButton,
  FormActions,
  FormField,
  FormInput,
  FormMediaCard,
  FormSection,
  FormSelect,
  FormTextarea,
  FormToggleRow,
} from "@/components/admin/form";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Percentage off regular price (`price` − `discount`) / `price` × 100, rounded. */
function discountPercentOff(
  priceVal: unknown,
  discountVal: unknown
): number | null {
  const price =
    typeof priceVal === "string"
      ? priceVal.trim() === ""
        ? NaN
        : Number(priceVal)
      : Number(priceVal);
  if (discountVal === "" || discountVal === null || discountVal === undefined) {
    return null;
  }
  const discount =
    typeof discountVal === "string"
      ? discountVal.trim() === ""
        ? NaN
        : Number(discountVal)
      : Number(discountVal);
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(discount) ||
    price <= 0 ||
    discount <= 0 ||
    discount >= price
  ) {
    return null;
  }
  return Math.round(((price - discount) / price) * 100);
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
    resolver: zodResolver(productSchema) as Resolver<ProductInput>,
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      description: "",
      price: 0,
      discountPrice: undefined,
      images: [],
      category: "embroidery",
      status: "active",
      stockQuantity: 0,
      trackInventory: false,
    },
    mode: "onBlur",
  });

  const normalizedInitial = useMemo(() => initialValues, [initialValues]);
  useEffect(() => {
    if (!normalizedInitial) return;
    reset(normalizedInitial);
    slugEditedRef.current = true;
  }, [normalizedInitial, reset]);

  const name = watch("name");
  const priceWatch = watch("price");
  const discountWatch = watch("discountPrice");
  const discountPct = discountPercentOff(priceWatch, discountWatch);
  const status = watch("status");
  const trackInventory = watch("trackInventory");
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-0">
        <FormSection title="Basic info">
          <FormField label="Product name" error={errors.name?.message}>
            <FormInput placeholder="Premium Floral Abaya Embroidery" {...register("name")} />
          </FormField>

          <FormField
            label="Slug"
            hint="Auto-generated, editable"
            error={errors.slug?.message}
          >
            <FormInput
              placeholder="premium-floral-abaya-embroidery"
              {...register("slug", {
                onChange: () => {
                  slugEditedRef.current = true;
                },
              })}
            />
          </FormField>

          <FormField
            label="SKU"
            hint="Stock keeping unit (unique)"
            error={errors.sku?.message}
          >
            <FormInput placeholder="e.g. AN-NISA-ABY-001" {...register("sku")} />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <FormTextarea
              placeholder="A short, elegant description (optional)…"
              {...register("description")}
            />
          </FormField>
        </FormSection>

        <div className="space-y-10">
          <FormSection title="Pricing">
            <div className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
              <FormField label="Price" error={errors.price?.message}>
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="120.00"
                  {...register("price")}
                />
              </FormField>
              <FormField
                label="Discount price"
                hint={
                  discountPct != null
                    ? `${discountPct}% off regular price`
                    : "Must be lower than regular price • optional"
                }
                error={errors.discountPrice?.message}
              >
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="99.00"
                  {...register("discountPrice")}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Category & status">
            <div className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
              <FormField label="Category" error={errors.category?.message}>
                <FormSelect {...register("category")}>
                  <option value="embroidery">Embroidery</option>
                  <option value="abaya">Abaya</option>
                  <option value="custom">Custom</option>
                  <option value="accessories">Accessories</option>
                </FormSelect>
              </FormField>

              <FormToggleRow
                label="Status"
                switchAriaLabel={status === "active" ? "Set to draft" : "Set to active"}
                leading={
                  status === "active" ? (
                    <IconCircleCheckFilled className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <IconCircleDotted className="h-5 w-5 shrink-0 text-black/40" />
                  )
                }
                caption={status === "active" ? "Active" : "Draft"}
                checked={status === "active"}
                onChange={(v) => setValue("status", v ? "active" : "draft")}
                disabled={isSaving}
                error={errors.status?.message}
              />
            </div>
          </FormSection>
        </div>
      </div>

      <FormSection
        title="Inventory"
        description="Control how stock is tracked for this SKU."
      >
        <div className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
          <FormField
            label="Units in stock"
            hint={
              trackInventory
                ? "Reduced when non-cancelled orders include this SKU."
                : "Turn on tracking to enforce stock on orders."
            }
            error={errors.stockQuantity?.message}
          >
            <FormInput
              type="number"
              min={0}
              step={1}
              disabled={isSaving}
              {...register("stockQuantity")}
            />
          </FormField>

          <FormToggleRow
            label="Track inventory"
            switchAriaLabel={
              trackInventory ? "Stop tracking inventory" : "Track inventory"
            }
            caption={
              trackInventory ? "Stock enforced on orders" : "Unlimited / manual"
            }
            checked={trackInventory}
            onChange={(v) => setValue("trackInventory", v, { shouldDirty: true })}
            disabled={isSaving}
            error={errors.trackInventory?.message}
          />
        </div>
      </FormSection>

      <FormSection title="Media">
        <FormMediaCard
          title="Product images"
          description="Drag and drop or click to upload. Files go to Cloudinary and are stored as URLs on the product."
        >
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
            <p className="mt-3 text-xs text-rose-600" role="alert">
              {errors.images.message}
            </p>
          ) : null}
        </FormMediaCard>
      </FormSection>

      <FormActions>
        <AdminFormButton
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
          disabled={isSaving}
        >
          Cancel
        </AdminFormButton>
        <AdminFormButton
          type="submit"
          loading={isSaving}
          disabled={isSaving || uploading}
        >
          {productId ? "Update product" : "Create product"}
        </AdminFormButton>
      </FormActions>
    </form>
  );
}
