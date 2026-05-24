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
  IconPlus,
  IconX,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { cn } from "@/lib/utils/cn";
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
  const [isGenerating, setIsGenerating] = useState(false);

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
      tagsText: "",
      brand: "",
      sizesText: "",
      colorsText: "",
      fabricType: "",
      embroideryType: "",
      ratingAverage: 4.8,
      ratingCount: 0,
      showInHero: false,
      featured: false,
      isTopRated: false,
      isCombo: false,
      trending: false,
      handmade: false,
      boutiquePick: false,
      newArrival: false,
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

  const tagsText = watch("tagsText") ?? "";
  const sizesText = watch("sizesText") ?? "";
  const colorsText = watch("colorsText") ?? "";

  const tagsList = useMemo(() => {
    return tagsText.split(",").map((t) => t.trim()).filter(Boolean);
  }, [tagsText]);

  const sizesList = useMemo(() => {
    return sizesText.split(",").map((s) => s.trim()).filter(Boolean);
  }, [sizesText]);

  const colorsList = useMemo(() => {
    return colorsText.split(",").map((c) => c.trim()).filter(Boolean);
  }, [colorsText]);

  const parsedColors = useMemo(() => {
    return colorsList.map((colorStr) => {
      let name = colorStr;
      let hex = "#1a1a1a";
      if (colorStr.includes("#")) {
        const parts = colorStr.split("#");
        name = parts[0]?.trim() || colorStr;
        const rawHex = parts[1]?.trim() || "";
        hex = rawHex.startsWith("#") ? rawHex : `#${rawHex}`;
      }
      return { name, hex, raw: colorStr };
    });
  }, [colorsList]);

  const [newTagInput, setNewTagInput] = useState("");
  const [newSizeInput, setNewSizeInput] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#fcc4c8");

  const handleAddTag = (tagStr: string) => {
    const trimmed = tagStr.trim().toLowerCase();
    if (!trimmed) return;
    if (tagsList.includes(trimmed)) {
      setNewTagInput("");
      return;
    }
    setValue("tagsText", [...tagsList, trimmed].join(", "), { shouldDirty: true });
    setNewTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setValue("tagsText", tagsList.filter((t) => t !== tag).join(", "), { shouldDirty: true });
  };

  const handleToggleSize = (sizeVal: string) => {
    const trimmed = sizeVal.trim();
    if (!trimmed) return;
    let nextSizes: string[];
    if (sizesList.includes(trimmed)) {
      nextSizes = sizesList.filter((s) => s !== trimmed);
    } else {
      nextSizes = [...sizesList, trimmed];
    }
    setValue("sizesText", nextSizes.join(", "), { shouldDirty: true });
  };

  const handleAddCustomSize = (sz: string) => {
    const trimmed = sz.trim();
    if (!trimmed) return;
    if (sizesList.includes(trimmed)) {
      setNewSizeInput("");
      return;
    }
    setValue("sizesText", [...sizesList, trimmed].join(", "), { shouldDirty: true });
    setNewSizeInput("");
  };

  const handleAddColor = (nameVal: string, hexVal: string) => {
    const nameTrimmed = nameVal.trim();
    const hexTrimmed = hexVal.trim();
    if (!nameTrimmed || !hexTrimmed) return;
    const rawVal = `${nameTrimmed}#${hexTrimmed.replace(/^#+/, "")}`;
    if (colorsList.includes(rawVal)) {
      setNewColorName("");
      return;
    }
    setValue("colorsText", [...colorsList, rawVal].join(", "), { shouldDirty: true });
    setNewColorName("");
  };

  const handleRemoveColor = (rawVal: string) => {
    setValue("colorsText", colorsList.filter((c) => c !== rawVal).join(", "), { shouldDirty: true });
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category: watch("category"),
          fabricType: watch("fabricType"),
          embroideryType: watch("embroideryType"),
          colors: parsedColors,
          sizes: sizesList,
          tags: tagsList,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate description");
      }

      const data = await res.json();
      setValue("description", data.description, { shouldDirty: true, shouldValidate: true });
      toast({
        title: "Success",
        message: "Description generated successfully!",
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        message: e.message || "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
            <div className="flex flex-col gap-2">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGenerateDescription();
                  }}
                  disabled={isGenerating || !name}
                  className="text-[11px] font-semibold bg-[#fcc4c8]/20 border border-[#fcc4c8]/40 text-brand-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:bg-[#fcc4c8]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-max"
                  title={!name ? "Please enter a product name first" : "Generate with Gemini AI"}
                >
                  {isGenerating ? <IconLoader2 className="w-3.5 h-3.5 animate-spin" /> : <IconSparkles className="w-3.5 h-3.5" />}
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <FormTextarea
                placeholder="A short, elegant description (optional)…"
                {...register("description")}
              />
            </div>
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
                  <option value="fashion">Women&apos;s fashion</option>
                  <option value="textiles">Fabrics</option>
                  <option value="handmade">Handmade</option>
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

      <FormSection
        title="Storefront details"
        description="Filters, badges, search — powering the boutique shop experience."
      >
        <div className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
          <FormField label="Brand" error={errors.brand?.message}>
            <FormInput placeholder="Studio / line name (optional)" {...register("brand")} />
          </FormField>
          <FormField label="Fabric" error={errors.fabricType?.message}>
            <FormInput placeholder="Silk linen, velvet…" {...register("fabricType")} />
          </FormField>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:items-stretch">
          <FormField label="Embroidery technique" error={errors.embroideryType?.message}>
            <FormInput placeholder="Zardozi, motif, tonal…" {...register("embroideryType")} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2 sm:items-stretch">
            <FormField label="Rating (average)" hint="0–5 display score" error={errors.ratingAverage?.message}>
              <FormInput
                type="number"
                step="0.1"
                min={0}
                max={5}
                {...register("ratingAverage")}
              />
            </FormField>
            <FormField label="Review count" error={errors.ratingCount?.message}>
              <FormInput type="number" min={0} step={1} {...register("ratingCount")} />
            </FormField>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <FormField
            label="Tags"
            hint="Press Enter or Comma to add tags"
            error={errors.tagsText?.message}
          >
            <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-3 shadow-sm min-h-[160px] flex flex-col justify-between">
              {/* List of current tags */}
              <div className="flex flex-wrap gap-1.5 align-top">
                {tagsList.length === 0 ? (
                  <span className="text-xs text-black/35 font-medium italic">No tags added yet.</span>
                ) : (
                  tagsList.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-[#fcc4c8]/20 border border-[#fcc4c8]/35 px-2.5 py-0.5 text-xs font-semibold text-brand-black"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="rounded-full p-0.5 hover:bg-[#fcc4c8]/40 transition text-black/50 hover:text-brand-black"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {/* Add input */}
              <div className="flex items-center gap-2 mt-auto">
                <input
                  type="text"
                  placeholder="Type a tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddTag(newTagInput);
                    }
                  }}
                  className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs text-brand-black focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(newTagInput)}
                  className="rounded-xl bg-[#0b0b0f] p-2 text-white hover:bg-black transition active:scale-95 shadow-sm"
                >
                  <IconPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </FormField>

          <FormField
            label="Sizes"
            hint="Select standard sizes or type custom ones"
            error={errors.sizesText?.message}
          >
            <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-4 shadow-sm min-h-[160px]">
              {/* Curated selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-black/45 block">Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  {["S", "M", "L", "XL", "XXL", "Free Size"].map((sz) => {
                    const active = sizesList.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleToggleSize(sz)}
                        className={cn(
                          "rounded-xl px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border",
                          active
                            ? "bg-[#fcc4c8] border-[#fcc4c8] text-brand-black shadow-sm font-bold scale-[1.02]"
                            : "border-black/5 bg-black/5 text-black/60 hover:bg-black/10"
                        )}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All selected values, including custom ones */}
              <div className="space-y-1.5 border-t border-black/5 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-black/45 block">Added Sizes</span>
                <div className="flex flex-wrap gap-1.5">
                  {sizesList.length === 0 ? (
                     <span className="text-xs text-black/35 font-medium italic">No sizes enabled.</span>
                  ) : (
                    sizesList.map((sz) => (
                      <div
                        key={sz}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#fcc4c8]/25 border border-[#fcc4c8]/40 px-2.5 py-0.5 text-xs font-semibold text-brand-black"
                      >
                        <span>{sz}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className="rounded-full p-0.5 hover:bg-[#fcc4c8]/40 transition text-black/50 hover:text-brand-black"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add custom size */}
              <div className="flex items-center gap-2 border-t border-black/5 pt-3">
                <input
                  type="text"
                  placeholder="Custom size (e.g. 3XL)..."
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSize(newSizeInput);
                    }
                  }}
                  className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs text-brand-black focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomSize(newSizeInput)}
                  className="rounded-xl bg-[#0b0b0f] p-2 text-white hover:bg-black transition active:scale-95 shadow-sm"
                >
                  <IconPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </FormField>

          <FormField
            label="Colors"
            hint="Define beautiful color pills with precise hex codes"
            error={errors.colorsText?.message}
          >
            <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-4 shadow-sm min-h-[160px]">
              {/* Preset Colors Fast Toggles */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-black/45 block">Atelier Presets</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Black", hex: "#1a1a1a" },
                    { name: "White", hex: "#ffffff" },
                    { name: "Red", hex: "#dc2626" },
                    { name: "Pink", hex: "#fcc4c8" },
                    { name: "Navy", hex: "#1e3a5f" },
                    { name: "Gold", hex: "#d4a853" },
                    { name: "Green", hex: "#16a34a" },
                    { name: "Maroon", hex: "#7f1d1d" },
                  ].map((preset) => {
                    const isAdded = parsedColors.some(
                      (pc) => pc.name.toLowerCase() === preset.name.toLowerCase()
                    );
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            const matched = parsedColors.find(
                              (pc) => pc.name.toLowerCase() === preset.name.toLowerCase()
                            );
                            if (matched) handleRemoveColor(matched.raw);
                          } else {
                            handleAddColor(preset.name, preset.hex);
                          }
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition cursor-pointer shadow-sm",
                          isAdded
                            ? "bg-[#fcc4c8] border-[#fcc4c8] text-brand-black scale-105"
                            : "border-black/5 bg-white text-black/60 hover:bg-black/5"
                        )}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-black/10 shadow-sm shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* List of current added colors with circles and names */}
              <div className="space-y-1.5 border-t border-black/5 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-black/45 block">Added Colors</span>
                <div className="flex flex-wrap gap-2">
                  {parsedColors.length === 0 ? (
                    <span className="text-xs text-black/35 font-medium italic">No colors configured.</span>
                  ) : (
                    parsedColors.map((col) => (
                      <div
                        key={col.raw}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-black/10 px-2.5 py-0.5 text-xs font-semibold text-brand-black shadow-sm animate-fadeIn"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="font-medium text-black/75">{col.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(col.raw)}
                          className="rounded-full p-0.5 hover:bg-black/5 transition text-black/40 hover:text-black"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add new custom color */}
              <div className="border-t border-black/5 pt-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-black/45 block">Custom Color Creator</span>
                <div className="flex items-center gap-2">
                  {/* Hex Picker Box */}
                  <div className="flex items-center gap-1 shrink-0 rounded-xl border border-black/10 bg-white p-1 shadow-sm">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="h-7 w-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono font-bold text-black/60 pr-2 uppercase select-all">
                      {newColorHex}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Color Name (e.g. Sapphire Blue)..."
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddColor(newColorName, newColorHex);
                      }
                    }}
                    className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs text-brand-black focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm"
                  />

                  <button
                    type="button"
                    onClick={() => handleAddColor(newColorName, newColorHex)}
                    className="rounded-xl bg-[#0b0b0f] p-2 text-white hover:bg-black transition active:scale-95 shadow-sm"
                  >
                    <IconPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Merchandising"
        description="Control how this piece appears across carousels and hero sliders."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormToggleRow
            label="Show in hero slider"
            switchAriaLabel={watch("showInHero") ? "Remove from hero slider" : "Add to hero slider"}
            caption="Large banner placement on the storefront"
            checked={watch("showInHero")}
            onChange={(v) => setValue("showInHero", v, { shouldDirty: true })}
            disabled={isSaving}
            error={errors.showInHero?.message}
          />
          <FormToggleRow
            label="Featured collection"
            switchAriaLabel={
              watch("featured") ? "Remove from featured" : "Promote as featured product"
            }
            caption='Appears inside "Featured products"'
            checked={watch("featured")}
            onChange={(v) => setValue("featured", v, { shouldDirty: true })}
            disabled={isSaving}
            error={errors.featured?.message}
          />
          <FormToggleRow
            label="Top rated spotlight"
            switchAriaLabel={
              watch("isTopRated") ? "Remove top rated spotlight" : "Highlight as top rated"
            }
            caption='Maps to "Top Rated" carousel'
            checked={watch("isTopRated")}
            onChange={(v) => setValue("isTopRated", v, { shouldDirty: true })}
            disabled={isSaving}
            error={errors.isTopRated?.message}
          />
          <FormToggleRow
            label="Combo offer"
            switchAriaLabel={
              watch("isCombo") ? "Remove combo offer flag" : "Mark as curated combo kit"
            }
            caption='Surfaces inside "Combo offers"'
            checked={watch("isCombo")}
            onChange={(v) => setValue("isCombo", v, { shouldDirty: true })}
            disabled={isSaving}
            error={errors.isCombo?.message}
          />
          <FormToggleRow
            label="Trending pulse"
            switchAriaLabel={
              watch("trending") ? "Remove trending ribbon" : "Mark as trending"
            }
            caption="Trending carousel + ribbons"
            checked={watch("trending")}
            onChange={(v) => setValue("trending", v, { shouldDirty: true })}
            disabled={isSaving}
            error={errors.trending?.message}
          />
          <FormToggleRow
            label="Handmade heirloom"
            switchAriaLabel={
              watch("handmade") ? "Remove handmade flag" : "Show as handcrafted"
            }
            caption="Handmade capsule collection lane"
            checked={watch("handmade")}
            onChange={(v) => setValue("handmade", v, { shouldDirty: true })}
            disabled={isSaving}
            error={errors.handmade?.message}
          />
          <FormToggleRow
            label="Premium boutique pick"
            switchAriaLabel={
              watch("boutiquePick") ? "Remove boutique pick ribbon" : "Curate boutique pick"
            }
            caption='"Premium boutique picks"'
            checked={watch("boutiquePick")}
            onChange={(v) => setValue("boutiquePick", v, { shouldDirty: true })}
            disabled={isSaving}
            error={errors.boutiquePick?.message}
          />
          <FormToggleRow
            label="New arrival"
            switchAriaLabel={
              watch("newArrival") ? "Remove new arrival sparkle" : "Feature as fresh drop"
            }
            caption='"New arrivals" lane'
            checked={watch("newArrival")}
            onChange={(v) => setValue("newArrival", v, { shouldDirty: true })}
            disabled={isSaving}
            error={errors.newArrival?.message}
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
