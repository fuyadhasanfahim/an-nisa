"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import { IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import type { ProductDto } from "@/store/api/productsApi";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import { cn } from "@/lib/utils/cn";

type HeroFallback = {
  title: string;
  subtitle: string;
  eyebrow: string;
  img: string;
  href: string;
};

const FALLBACK_SLIDES: HeroFallback[] = [
  {
    eyebrow: "Signature needle stories",
    title: "Celestial petals inked with calm authority",
    subtitle:
      "Layered tonal blooms, restrained shimmer, heirloom finishing—elevated staples for wardrobes that crave poetry.",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2400&auto=format&fit=crop",
    href: "#boutique-catalog",
  },
  {
    eyebrow: "Ribboned collars",
    title: "Stitched vignettes anchored in softness",
    subtitle:
      "Hand-guided tension, luminous cloth, tactile couture weight—minimal silhouettes amplified by obsessive craft.",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2400&auto=format&fit=crop",
    href: "#boutique-catalog",
  },
];

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed hero load");
  return (await res.json()) as {
    items: ProductDto[];
  };
}

export function BoutiqueHero() {
  const [slideIdx, setSlideIdx] = useState(0);

  const { data } = useQuery({
    queryKey: ["products", "hero-carousel"],
    queryFn: () => fetchJson("/api/products?hero=true&limit=6&sortMode=latest"),
  });

  const slides = useMemo(() => {
    const heroItems =
      data?.items?.filter((item) => item.images?.length) ??
      ([] as ProductDto[]);
    if (!heroItems.length) return FALLBACK_SLIDES;
    return heroItems.map(
      (item): HeroFallback => ({
        eyebrow: item.embroideryType?.trim() ?? "Hero spotlight",
        title: item.name,
        subtitle:
          item.description?.trim() ??
          `An-Nisa heirloom finish — priced at ${formatBdtFromCents(
            item.effectivePriceCents,
            item.currency
          )}.`,
        img: item.images[0],
        href: `#product-${item.slug}`,
      })
    );
  }, [data]);

  useEffect(() => {
    setSlideIdx(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlideIdx((idx) => (idx + 1) % slides.length);
    }, 6400);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[slideIdx];

  return (
    <section className="relative overflow-hidden border-b border-black/5 bg-gradient-to-br from-[#fff5f9] via-white to-[#fef6ff] pb-24 pt-20 dark:border-white/10 dark:from-brand-black dark:via-[#120711] dark:to-brand-black md:pb-28">
      <div className="pointer-events-none absolute -left-[14%] top-[-35%] h-[420px] w-[420px] rounded-full bg-brand-pink/45 blur-[120px] dark:bg-brand-pink/20" />
      <div className="pointer-events-none absolute -right-10 bottom-[-30%] h-[560px] w-[560px] rounded-full bg-rose-300/42 blur-[150px] dark:bg-rose-700/22" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-[1.06fr_minmax(0,0.9fr)]">
          <motion.div
            key={`${slide.title}-${slideIdx}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.2, 0.85, 0.2, 1] }}
            className="space-y-9"
          >
            <motion.span className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-white/90 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-black/62 shadow-softSm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white/73">
              <IconSparkles className="h-4 w-4 text-rose-700" stroke={1.65} />
              {slide.eyebrow}
            </motion.span>
            <motion.h1
              className="font-serif text-5xl tracking-tight text-brand-black md:text-[3.9rem] dark:text-[#fdf2f9]"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              {slide.title}
              <motion.span className="mt-4 block font-sans text-sm font-semibold uppercase tracking-[0.32em] text-black/50 dark:text-white/65">
                Needle-guided couture for her
              </motion.span>
            </motion.h1>
            <p className="max-w-[54ch] text-lg leading-relaxed text-black/70 dark:text-white/75">
              {slide.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full px-9">
                <Link href="/#boutique-catalog">Shop the heirloom edit</Link>
              </Button>
              <Link
                href="/custom-order"
                className="inline-flex rounded-full px-11 py-[0.92rem] text-xs font-semibold uppercase tracking-[0.18em] text-brand-black underline-offset-[7px] transition hover:bg-black/[0.04] dark:border dark:border-white/15 dark:bg-transparent dark:text-white"
              >
                Commission bespoke thread
              </Link>
            </div>
          </motion.div>

          <motion.div
            layout
            className="relative aspect-[16/17] rounded-[38px] border border-black/10 bg-gradient-to-br from-white via-[#ffeef9] to-white p-9 shadow-soft dark:border-white/10 dark:from-brand-black dark:via-[#1f111f] dark:to-brand-black lg:aspect-[17/17]"
          >
            <motion.div key={slide.img} layout className="absolute inset-[20px] overflow-hidden rounded-[30px]" initial={{ opacity: 0.6 }}>
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                priority
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-between px-7 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/74">
                <span>Carousel</span>
                <span suppressHydrationWarning>
                  {slideIdx + 1}/{slides.length}
                </span>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-24 h-52 bg-gradient-to-t from-black/75 via-transparent" />
            </motion.div>

            <div className="absolute -bottom-16 left-[4%] right-[4%] flex gap-3 overflow-x-auto pb-3">
              {slides.map((thumb, idx) => (
                <button
                  key={`${thumb.title}-${idx}`}
                  type="button"
                  aria-label={`Reveal slide ${idx + 1}`}
                  aria-current={idx === slideIdx}
                  onClick={() => setSlideIdx(idx)}
                  className={cn(
                    "relative h-[140px] w-[118px] shrink-0 overflow-hidden rounded-[26px] border border-white shadow-softSm transition",
                    idx === slideIdx ? "outline outline-4 outline-brand-pink/70" : "opacity-72 hover:opacity-100"
                  )}
                >
                  <Image src={thumb.img} alt="" fill sizes="220px" className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
