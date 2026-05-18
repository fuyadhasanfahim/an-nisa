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
    <footer className="mt-auto border-t-2 border-brand-pink/40 bg-gradient-to-b from-brand-cream via-white to-brand-pink/10 pt-14 pb-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-pink to-brand-pink/70 text-sm font-bold text-brand-black shadow-sm">
                AN
              </div>
              <span className="font-serif text-xl tracking-tight text-brand-black">
                An‑Nisa
              </span>
            </div>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-brand-black/55">
              Premium women&apos;s fashion — embroidery, handmade designs, and bespoke pieces crafted with care.
            </p>

            {/* Contact */}
            <div className="mt-5 space-y-1.5 text-sm text-brand-black/50">
              <p>📧 support@annisa.world</p>
              <p>📱 +880 1XXX-XXXXXX</p>
            </div>

            {/* Social */}
            <div className="mt-5 flex gap-4 text-sm font-medium text-brand-black/45">
              <a
                href="https://instagram.com"
                className="transition hover:text-brand-black"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                className="transition hover:text-brand-black"
              >
                Facebook
              </a>
              <a
                href="https://tiktok.com"
                className="transition hover:text-brand-black"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-black/45">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-brand-black/60">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition hover:text-brand-black"
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
        <div className="glass mt-10 flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-brand-black">
              Subscribe to our newsletter
            </h4>
            <p className="mt-1 text-xs text-brand-black/45">
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
              className="rounded-xl border border-brand-pink/25 bg-white/80 px-4 py-2.5 text-sm text-brand-black backdrop-blur-sm focus:border-brand-pink focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#1a1a1a] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1a1a1a]/85"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-3 border-t border-brand-pink/20 pt-6 text-xs text-brand-black/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} An‑Nisa. All rights reserved.</p>
          <p>Handcrafted with care in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
