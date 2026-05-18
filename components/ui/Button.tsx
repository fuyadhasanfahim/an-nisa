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
      ? "bg-[#1a1a1a] text-white shadow-sm hover:bg-[#1a1a1a]/85"
      : variant === "outline"
        ? "border border-brand-pink/20 bg-transparent text-[#1a1a1a] hover:bg-brand-pink/10"
        : "bg-transparent text-[#1a1a1a] hover:bg-brand-pink/10";

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
