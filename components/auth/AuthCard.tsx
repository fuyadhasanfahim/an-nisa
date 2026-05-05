"use client";

import { motion } from "framer-motion";
import { IconSparkles } from "@tabler/icons-react";

type AuthCardProps = {
  brandText?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthCard({ brandText, title, subtitle, children }: AuthCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-soft"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl stitch-border opacity-40" />

      <div className="relative">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-10 w-10 place-items-center rounded-xl">
            <IconSparkles className="h-5 w-5 text-brand-black" stroke={1.6} />
          </div>

          {brandText ? (
            <div className="mt-3 text-xs font-medium tracking-[0.18em] text-black/60">
              {brandText}
            </div>
          ) : null}

          <h1 className="mt-4 font-serif text-3xl tracking-tight text-brand-black">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-black/60">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </motion.section>
  );
}

