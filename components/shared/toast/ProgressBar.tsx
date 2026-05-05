"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import type { ToastVariant } from "@/components/shared/toast/Toast";

type ProgressBarProps = {
  progress: ReturnType<typeof useMotionValue<number>>;
  variant: ToastVariant;
};

export function ProgressBar({ progress, variant }: ProgressBarProps) {
  const width = useTransform(progress, (v) => `${v}%`);
  return (
    <div className="h-[2px] w-full overflow-hidden bg-neutral-200">
      <motion.div
        className={[
          "h-full",
          variant === "success"
            ? "bg-emerald-500"
            : variant === "error"
              ? "bg-rose-500"
              : variant === "warning"
                ? "bg-amber-500"
                : "bg-sky-500",
        ].join(" ")}
        style={{ width }}
      />
    </div>
  );
}

