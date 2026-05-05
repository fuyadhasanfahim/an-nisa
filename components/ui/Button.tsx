"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "ghost";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium tracking-tight transition focus:outline-none focus:ring-2 focus:ring-brand-pink/50";
  const styles =
    variant === "primary"
      ? "bg-brand-black text-white shadow-softSm hover:bg-black"
      : "bg-transparent text-brand-black hover:bg-black/5";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${styles} ${className}`}
      {...props}
    />
  );
}

