"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconAlertTriangle } from "@tabler/icons-react";

export type ConfirmAlertDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Called when the user confirms. Close the dialog from here after success. */
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  /** `destructive` applies delete / danger styling to the panel and confirm control. */
  variant?: "default" | "destructive";
};

export function ConfirmAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  variant = "default",
}: ConfirmAlertDialogProps) {
  const labelId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onOpenChange]);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!mounted || !open) return null;

  const destructive = variant === "destructive";

  const panelAccent = destructive
    ? "border-t-[3px] border-t-rose-600 ring-1 ring-rose-200/70 shadow-[0_8px_30px_rgb(244,63,94,0.12)]"
    : "ring-1 ring-black/10";

  const confirmStyles = destructive
    ? "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500/50 disabled:hover:bg-rose-600"
    : "bg-[#0b0b0f] text-white shadow-sm hover:bg-black focus-visible:ring-brand-pink/40";

  const body = (
    <div
      className="fixed inset-0 z-200 grid place-items-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={() => !loading && onOpenChange(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        className={[
          "relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl outline-none",
          panelAccent,
        ].join(" ")}
      >
        <div className="flex gap-4">
          {destructive ? (
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700"
              aria-hidden
            >
              <IconAlertTriangle className="h-6 w-6" stroke={1.75} />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2
              id={labelId}
              className="font-serif text-lg font-medium tracking-tight text-brand-black"
            >
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-2 text-sm leading-relaxed text-black/65">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className={[
              "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition",
              "bg-white text-brand-black ring-1 ring-black/12 hover:bg-black/5",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40",
              "disabled:opacity-50",
            ].join(" ")}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={[
              "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition",
              "focus:outline-none focus-visible:ring-2 disabled:opacity-60",
              confirmStyles,
            ].join(" ")}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
