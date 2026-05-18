"use client";

import { cloneElement, isValidElement } from "react";
import type { ReactElement } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "ghost" | "outline";

type ButtonProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: Variant;
  /** Render as the single child element (e.g. `Link`) — carries button styling. */
  asChild?: boolean;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  asChild,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium tracking-tight transition focus:outline-none focus:ring-2 focus:ring-brand-pink/50";
  const styles =
    variant === "primary"
      ? "bg-brand-black text-white shadow-softSm hover:bg-black dark:bg-white dark:text-brand-black dark:hover:bg-white/90"
      : variant === "outline"
        ? "border border-black/20 bg-transparent text-brand-black hover:bg-black/[0.04] dark:border-white/22 dark:text-white dark:hover:bg-white/[0.07]"
        : "bg-transparent text-brand-black hover:bg-black/[0.04] dark:text-white dark:hover:bg-white/[0.08]";

  const composedClass = cn(base, styles, className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(composedClass, child.props.className),
    });
  }

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className={composedClass}
      {...props}
    >
      {children}
    </motion.button>
  );
}
