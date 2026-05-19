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
      className="relative mx-auto w-full max-w-md rounded-3xl bg-white border border-[#fcc4c8]/35 p-8 shadow-[0_20px_50px_rgba(252,196,200,0.2)] backdrop-blur-md"
    >
      <div className="relative">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#fcc4c8]/50 bg-[#fcc4c8]/10 text-brand-black">
            <IconSparkles className="h-5 w-5" stroke={1.8} />
          </div>

          {brandText ? (
            <div className="mt-3.5 text-[10px] font-bold tracking-[0.25em] text-black/45 uppercase">
              {brandText}
            </div>
          ) : null}

          <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-black">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-xs text-xs font-semibold leading-relaxed text-black/40">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </motion.section>
  );
}

