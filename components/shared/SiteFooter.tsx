"use client";

import Link from "next/link";
import { Container } from "@/components/shared/Container";

const columns = [
  {
    heading: "Boutique",
    links: [
      { label: "Heirloom shop", href: "/#boutique-catalog" },
      { label: "Custom stitch requests", href: "/custom-order" },
      { label: "Concierge gifting", href: "mailto:support@annisa.world" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping & timelines", href: "/policies/shipping" },
      { label: "Returns & swaps", href: "/policies/returns" },
      { label: "Care guide", href: "/policies/care" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/policies/privacy" },
      { label: "Terms", href: "/policies/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 bg-[linear-gradient(to_bottom,var(--muted),transparent)] pb-24 pt-20 dark:border-white/14 dark:bg-white/[0.05] md:pb-16">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1fr_minmax(0,520px)_minmax(0,320px)]">
          <div>
            <div className="font-serif text-3xl tracking-tight">An‑Nisa</div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-black/65 dark:text-white/73">
              A needle-first atelier marrying heritage embroidery rhythms with luminous modern femininity.
            </p>
            <div className="mt-6 flex gap-5 text-[11px] uppercase tracking-[0.22em] text-black/53 dark:text-white/65">
              <a href="https://instagram.com" className="hover:text-brand-black dark:hover:text-white">
                IG
              </a>
              <a href="https://pinterest.com" className="hover:text-brand-black dark:hover:text-white">
                Pins
              </a>
              <a href="https://tiktok.com" className="hover:text-brand-black dark:hover:text-white">
                StitchTok
              </a>
            </div>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {columns.map((col) => (
              <div key={col.heading}>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-black/50 dark:text-white/62">
                  {col.heading}
                </div>
                <ul className="mt-4 space-y-3 text-sm text-black/73 dark:text-white/75">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="transition hover:text-brand-black dark:hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-[32px] border border-brand-pink/60 bg-brand-pink/25 p-6 shadow-softSm dark:bg-white/[0.04] dark:shadow-soft">
            <div className="text-xs uppercase tracking-[0.24em] text-black/60 dark:text-white/65">
              Thread letters
            </div>
            <p className="mt-4 text-sm leading-relaxed text-black/73 dark:text-white/73">
              Seasonal heirloom drops & private tailoring notes—straight to inbox.
            </p>
            <form className="mt-6 space-y-3" aria-label="Newsletter signup" onSubmit={(e) => {
              e.preventDefault();
            }}>
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                required
                type="email"
                placeholder="studio@threads.com"
                className="w-full rounded-full border border-black/10 bg-white px-5 py-[0.8rem] text-sm text-brand-black shadow-inner shadow-black/[0.04] dark:border-white/15 dark:bg-black/65 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-brand-black px-5 py-[0.9rem] text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-brand-black"
              >
                Stay looped in
              </button>
              <div className="text-[11px] text-black/55 dark:text-white/62">
                We promise couture pacing—thoughtful sporadic sparkle, zero spam bursts.
              </div>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-black/12 pt-8 text-[11px] uppercase tracking-[0.24em] text-black/53 dark:border-white/12 dark:text-white/65 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} An‑Nisa atelier embroidery</div>
          <div className="rounded-full px-6 py-[0.62rem] text-[11px] font-semibold normal-case uppercase tracking-normal text-black/73 dark:bg-white/[0.04] dark:text-white/73">
            Hand guided • Feminine luminous • Consciously tactile
          </div>
        </div>
      </Container>
    </footer>
  );
}
