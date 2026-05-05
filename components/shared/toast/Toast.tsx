"use client";

import { AnimatePresence, motion, useMotionValue, animate } from "framer-motion";
import {
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProgressBar } from "@/components/shared/toast/ProgressBar";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastData = {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  version?: number;
  durationMs?: number; // default: 4500
};

type ToastProps = {
  toast: ToastData;
  onClose: (id: string) => void;
};

export function Toast({ toast, onClose }: ToastProps) {
  const durationMs = toast.durationMs ?? 4500;
  const variant = toast.variant ?? "success";
  const version = toast.version ?? 0;

  // Progress is 100 -> 0
  const progress = useMotionValue(100);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const remainingMsRef = useRef(durationMs);
  const [hovered, setHovered] = useState(false);

  const label = useMemo(() => {
    if (toast.title) return toast.title;
    return "Notice";
  }, [toast.title]);

  function start(fromPercent: number, remainingMs: number) {
    controlsRef.current?.stop();
    progress.set(fromPercent);
    controlsRef.current = animate(progress, 0, {
      duration: remainingMs / 1000,
      ease: "linear",
      onComplete: () => onClose(toast.id),
    });
  }

  useEffect(() => {
    start(100, durationMs);
    return () => controlsRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, version]);

  function pause() {
    controlsRef.current?.stop();
    const p = progress.get(); // 0..100
    remainingMsRef.current = (p / 100) * durationMs;
  }

  function resume() {
    const p = progress.get();
    start(p, remainingMsRef.current);
  }

  useEffect(() => {
    if (!hovered) return;
    pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        resume();
      }}
      className="pointer-events-auto w-[340px]"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        className="overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-neutral-200"
      >
        <div className="flex items-start gap-3 p-4">
          <div
            className={[
              "mt-0.5 grid h-9 w-9 place-items-center rounded-xl",
              variant === "success"
                ? "bg-emerald-500/10"
                : variant === "error"
                  ? "bg-rose-500/10"
                  : variant === "warning"
                    ? "bg-amber-500/10"
                    : "bg-sky-500/10",
            ].join(" ")}
          >
            {variant === "success" ? (
              <IconCheck className="h-5 w-5 text-emerald-700" stroke={2} />
            ) : variant === "error" ? (
              <IconX className="h-5 w-5 text-rose-700" stroke={2} />
            ) : variant === "warning" ? (
              <IconAlertTriangle className="h-5 w-5 text-amber-700" stroke={2} />
            ) : (
              <IconInfoCircle className="h-5 w-5 text-sky-700" stroke={2} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-black/50">{label}</div>
            <div className="mt-1 text-sm font-semibold text-brand-black">
              {toast.message}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose(toast.id)}
            aria-label="Close"
            className="mt-0.5 rounded-lg p-1 text-black/50 transition hover:bg-black/5 hover:text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-pink/40"
          >
            <IconX className="h-4 w-4" stroke={2} />
          </button>
        </div>

        <ProgressBar progress={progress} variant={variant} />
      </motion.div>
    </div>
  );
}

export function ToastViewport({
  toasts,
  onClose,
}: {
  toasts: ToastData[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

