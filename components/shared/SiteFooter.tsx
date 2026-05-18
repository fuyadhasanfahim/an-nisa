"use client";

import Link from "next/link";

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/#" },
      { label: "New Arrivals", href: "/?newArrival=true" },
      { label: "Custom Orders", href: "/custom-order" },
      { label: "On Sale", href: "/?onSale=true" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping & Delivery", href: "/policies/shipping" },
      { label: "Returns & Exchange", href: "/policies/returns" },
      { label: "Care Guide", href: "/policies/care" },
      { label: "Contact Us", href: "mailto:support@annisa.world" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/policies/terms" },
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Terms of Service", href: "/policies/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-brand-pink/40 bg-brand-cream pt-14 pb-10 dark:border-brand-pink/20 dark:bg-[#0e0b10]">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pink/60 text-sm font-bold text-brand-black">
                AN
              </div>
              <span className="font-serif text-xl tracking-tight text-brand-black dark:text-white">
                An‑Nisa
              </span>
            </div>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-black/55 dark:text-white/60">
              Premium women&apos;s fashion — embroidery, handmade designs, and bespoke pieces crafted with care.
            </p>

            {/* Contact */}
            <div className="mt-5 space-y-1.5 text-sm text-black/50 dark:text-white/50">
              <p>📧 support@annisa.world</p>
              <p>📱 +880 1XXX-XXXXXX</p>
            </div>

            {/* Social */}
            <div className="mt-5 flex gap-4 text-sm text-black/45 dark:text-white/50">
              <a
                href="https://instagram.com"
                className="transition hover:text-brand-black dark:hover:text-white"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                className="transition hover:text-brand-black dark:hover:text-white"
              >
                Facebook
              </a>
              <a
                href="https://tiktok.com"
                className="transition hover:text-brand-black dark:hover:text-white"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black/45 dark:text-white/50">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-black/65 dark:text-white/65">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition hover:text-brand-black dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-10 flex flex-col gap-4 rounded-xl border border-brand-pink/30 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:bg-white/[0.04]">
          <div>
            <h4 className="text-sm font-semibold text-brand-black dark:text-white">
              Subscribe to our newsletter
            </h4>
            <p className="mt-1 text-xs text-black/50 dark:text-white/50">
              Get updates on new arrivals, offers, and more.
            </p>
          </div>
          <form
            className="flex gap-2"
            aria-label="Newsletter signup"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              required
              type="email"
              placeholder="your@email.com"
              className="rounded-lg border border-black/10 bg-brand-lightgray px-4 py-2 text-sm text-brand-black focus:border-brand-pink focus:outline-none dark:border-white/12 dark:bg-white/8 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-black px-5 py-2 text-xs font-semibold text-white transition hover:bg-black/85 dark:bg-white dark:text-brand-black dark:hover:bg-white/90"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-3 border-t border-black/8 pt-6 text-xs text-black/40 sm:flex-row sm:items-center sm:justify-between dark:border-white/8 dark:text-white/40">
          <p>© {new Date().getFullYear()} An‑Nisa. All rights reserved.</p>
          <p>Handcrafted with care in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
