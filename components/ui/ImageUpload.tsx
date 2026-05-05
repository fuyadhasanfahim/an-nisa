"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { IconUpload, IconX, IconLoader2, IconRefresh } from "@tabler/icons-react";

type UploadItem = {
  id: string;
  file?: File;
  previewUrl: string;
  status: "queued" | "uploading" | "success" | "error";
  uploadedUrl?: string;
  error?: string;
  source: "local" | "remote";
};

function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

async function uploadToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    // Debug tooling
    console.error("[cloudinary] missing env", { cloudName, preset });
    throw new Error(
      "Cloudinary env vars are missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  console.log("[cloudinary] upload:start", {
    name: file.name,
    size: file.size,
    type: file.type,
    url,
    preset,
  });

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30000);

  let status = 0;
  let data: unknown = null;
  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    status = res.status;
    data = await res.json().catch(() => null);
  } finally {
    window.clearTimeout(timeoutId);
  }

  console.log("[cloudinary] upload:response", { status, data });

  if (status < 200 || status >= 300) {
    const maybe = data as { error?: { message?: unknown } } | null;
    const msg =
      typeof maybe?.error?.message === "string"
        ? maybe.error.message
        : "Cloudinary upload failed";
    throw new Error(msg);
  }

  const secureUrl = (data as { secure_url?: unknown } | null)?.secure_url;
  if (typeof secureUrl !== "string" || !secureUrl.length) {
    throw new Error("Cloudinary response missing secure_url");
  }

  return secureUrl;
}

export function ImageUpload({
  value,
  onChange,
  maxFiles = 8,
  disabled,
  onUploadingChange,
  onError,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
  onError?: (message: string) => void;
}) {
  const [localItems, setLocalItems] = useState<UploadItem[]>([]);
  const localRef = useRef<UploadItem[]>([]);
  const valueRef = useRef<string[]>(value);
  useEffect(() => {
    localRef.current = localItems;
  }, [localItems]);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const uploadingCount = useMemo(
    () =>
      localItems.filter(
        (i) => i.status === "uploading" || i.status === "queued"
      ).length,
    [localItems]
  );

  useEffect(() => {
    onUploadingChange?.(uploadingCount > 0);
  }, [uploadingCount, onUploadingChange]);

  useEffect(() => {
    return () => {
      localRef.current.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    };
  }, []);

  const startUpload = useCallback(
    async (id: string) => {
      setLocalItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "uploading", error: undefined } : i
        )
      );
      try {
        const item = localRef.current.find((i) => i.id === id);
        if (!item) return;
        if (!item.file) throw new Error("File missing for upload.");
        const secureUrl = await uploadToCloudinary(item.file);

        // Add uploaded URL to form state (dedupe)
        const nextUrls = Array.from(new Set([...(valueRef.current ?? []), secureUrl]));
        onChange(nextUrls);

        // Remove local item (we'll render the remote URL from `value`)
        setLocalItems((prev) => {
          const current = prev.find((x) => x.id === id);
          if (current) URL.revokeObjectURL(current.previewUrl);
          return prev.filter((x) => x.id !== id);
        });
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Upload failed. Please try again.";
        console.error("[cloudinary] upload:error", e);
        setLocalItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, status: "error", error: message } : i
          )
        );
        onError?.(message);
      }
    },
    [onChange, onError]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (!accepted.length) return;
      if (disabled) return;

      const current = (valueRef.current?.length ?? 0) + localRef.current.length;
      const room = Math.max(0, maxFiles - current);
      const slice = accepted.slice(0, room);
      if (slice.length < accepted.length) {
        onError?.(`You can upload up to ${maxFiles} images.`);
      }

      const nextItems: UploadItem[] = slice.map((file) => ({
        id: uid(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "queued",
        source: "local",
      }));

      setLocalItems((prev) => [...prev, ...nextItems]);

      // start uploads sequential-ish (but not blocking UI)
      nextItems.forEach((it) => {
        void startUpload(it.id);
      });
    },
    [disabled, maxFiles, onError, startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    disabled,
    maxFiles,
  });

  const remoteItems: UploadItem[] = useMemo(
    () =>
      (value ?? []).map((url) => ({
        id: `remote:${url}`,
        previewUrl: url,
        status: "success",
        uploadedUrl: url,
        source: "remote",
      })),
    [value]
  );

  const allItems = useMemo(() => [...remoteItems, ...localItems], [remoteItems, localItems]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={[
          "rounded-xl border-2 border-dashed p-6 text-center transition",
          "bg-white",
          isDragActive ? "border-[#fcc4c8] bg-[#fcc4c8]/10" : "border-black/10",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-black/2",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <div className="mx-auto grid max-w-sm place-items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/5">
            <IconUpload className="h-5 w-5 text-black/60" stroke={1.8} />
          </div>
          <div className="text-sm font-medium text-brand-black">
            Drag & drop images or click to upload
          </div>
          <div className="text-xs text-black/50">
            PNG, JPG, WEBP — up to {maxFiles} images
          </div>
        </div>
      </div>

      {allItems.length ? (
        <div className="grid grid-cols-3 gap-3">
          {allItems.map((it) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/5"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.18 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.previewUrl}
                alt={it.file?.name ?? "Uploaded image"}
                className="h-24 w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

              <div className="absolute right-2 top-2 flex gap-2">
                {it.status === "error" ? (
                  <button
                    type="button"
                    onClick={() => void startUpload(it.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-black/60 shadow-sm transition hover:text-brand-black"
                    aria-label="Retry upload"
                  >
                    <IconRefresh className="h-4 w-4" stroke={2} />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    if (it.source === "remote" && it.uploadedUrl) {
                      onChange((valueRef.current ?? []).filter((u) => u !== it.uploadedUrl));
                      return;
                    }
                    setLocalItems((prev) => {
                      const current = prev.find((x) => x.id === it.id);
                      if (current) URL.revokeObjectURL(current.previewUrl);
                      return prev.filter((x) => x.id !== it.id);
                    });
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-black/60 shadow-sm transition hover:text-brand-black"
                  aria-label="Remove image"
                >
                  <IconX className="h-4 w-4" stroke={2} />
                </button>
              </div>

              {(it.status === "uploading" || it.status === "queued") && (
                <div className="absolute inset-0 grid place-items-center bg-white/70">
                  <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-black/70 shadow-sm ring-1 ring-black/5">
                    <IconLoader2 className="h-4 w-4 animate-spin" stroke={2} />
                    Uploading…
                  </div>
                </div>
              )}

              {it.status === "error" ? (
                <div className="absolute inset-x-0 bottom-0 bg-white/95 px-2 py-1 text-[11px] text-rose-700">
                  {it.error ? it.error : "Upload failed"}
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-black/50">
          Uploaded URLs in form: {value.length}
        </div>
      )}
    </div>
  );
}

