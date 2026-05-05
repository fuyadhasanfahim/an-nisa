"use client";

import { motion, type MotionProps } from "framer-motion";

const variants: NonNullable<MotionProps["variants"]> = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}

