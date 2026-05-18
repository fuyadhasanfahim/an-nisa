"use client";

import { useMemo, useState } from "react";
import { IconQuote } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

type ReviewCard = {
  name: string;
  title: string;
  quote: string;
  avatar: string;
};

const CLIENT_REVIEWS: ReviewCard[] = [
  {
    name: "Aisha Rahman",
    title: "Bridal heirloom client",
    quote:
      "The garden stole my breath—in person the floss reads like watercolor. Truly atelier pacing and couture tenderness.",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Layla Yusuf",
    title: "Stylist collective",
    quote:
      "Hand-guided tension is unmatched. Pieces arrive scented, wrapped, immaculate—my clients obsess over bespoke cuffs.",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Haniya Karim",
    title: "Textile muse",
    quote:
      "The embroidery melts into fabric—you feel the workmanship before you notice it. That’s rarity today.",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
  },
];

export function BoutiqueReviewsCarousel() {
  const [idx, setIdx] = useState(0);

  const active = useMemo(() => CLIENT_REVIEWS[idx], [idx]);

  return (
    <section className="border-y border-black/10 bg-linear-to-br from-[#fdf4f9] via-white to-[#fffefb] py-16 dark:border-white/10 dark:from-brand-black dark:via-[#12060e] dark:to-brand-black">
      <div className="mx-auto max-w-[1200px] px-6 text-center lg:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/53 dark:text-white/62">
          Customer stories
        </p>
        <h2 className="mt-3 font-serif text-3xl text-brand-black md:text-[2.2rem] dark:text-white">
          Trusted by women weaving tradition into dressing rituals
        </h2>

        <div className="mt-12 mx-auto grid max-w-4xl rounded-[38px] border border-black/8 bg-white/90 p-10 text-left shadow-soft dark:border-white/15 dark:bg-white/11">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.65, ease: [0.2, 0.85, 0.2, 1] }}
            >
              <IconQuote className="h-8 w-8 text-brand-pink" stroke={1.5} />
              <p className="mt-5 text-xl leading-snug text-black/82 dark:text-white/85">{active.quote}</p>
              <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-[68px] w-[68px] overflow-hidden rounded-full border border-brand-pink/60">
                    <Image src={active.avatar} alt={active.name} fill className="object-cover" sizes="140px" />
                  </div>
                  <div>
                    <div className="font-semibold text-brand-black dark:text-white">{active.name}</div>
                    <div className="text-sm text-black/60 dark:text-white/65">{active.title}</div>
                  </div>
                </div>
                <div className="flex justify-center gap-2 sm:justify-end">
                  {CLIENT_REVIEWS.map((review, bullet) => (
                    <button
                      key={review.name}
                      type="button"
                      aria-label={`Show review ${review.name}`}
                      onClick={() => setIdx(bullet)}
                      className={[
                        "h-2 rounded-full bg-black/25 transition-[width] dark:bg-white/40",
                        idx === bullet ? "w-8" : "w-3",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
