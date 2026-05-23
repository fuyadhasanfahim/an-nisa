"use client";

import Link from "next/link";
import Image from "next/image";
import { IconBrandInstagram, IconBrandFacebook, IconBrandTiktok, IconMail, IconPhone } from "@tabler/icons-react";

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/#" },
      { label: "New Arrivals", href: "/?newArrival=true" },
      { label: "On Sale", href: "/?onSale=true" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping & Delivery", href: "/policies/shipping" },
      { label: "Returns & Exchange", href: "/policies/returns" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Terms of Service", href: "/policies/terms" },
    ],
  },
];

export function SiteFooter() {
  const footerPhone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+880 1789-555666";
  const footerEmail = process.env.NEXT_PUBLIC_EMAIL || "support@annisa.world";

  return (
    <footer className="mt-auto border-t border-[#fcc4c8]/35 bg-gradient-to-b from-white via-[#fffbfa] to-[#fff5f6] pt-16 pb-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          {/* Brand & Description */}
          <div className="space-y-5">
            <div className="flex items-center">
              <Link href="/" className="inline-block select-none transition duration-300 active:scale-[0.98]">
                <div className="bg-[#fcc4c8] px-4 py-2 border border-[#fcc4c8]/10">
                  <span className="font-serif text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-brand-black whitespace-nowrap leading-none">
                    An Nisa&apos;s World
                  </span>
                </div>
              </Link>
            </div>
            <p className="max-w-[300px] text-sm leading-relaxed text-brand-black/55">
              Premium women&apos;s fashion — embroidery, handmade designs, and bespoke pieces crafted with care.
            </p>

            {/* Contact details */}
            <div className="space-y-2 text-sm text-brand-black/50">
              <a href={`mailto:${footerEmail}`} className="flex items-center gap-2 hover:text-[#fcc4c8] transition duration-300">
                <IconMail className="h-4 w-4 text-[#fcc4c8]" stroke={2} />
                <span>{footerEmail}</span>
              </a>
              <a href={`tel:${footerPhone}`} className="flex items-center gap-2 hover:text-[#fcc4c8] transition duration-300">
                <IconPhone className="h-4 w-4 text-[#fcc4c8]" stroke={2} />
                <span>{footerPhone}</span>
              </a>
            </div>

            {/* Social handles */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#fcc4c8]/40 bg-white/70 text-brand-black/60 shadow-sm transition duration-300 hover:scale-105 hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8] hover:text-brand-black cursor-pointer"
              >
                <IconBrandInstagram className="h-[18px] w-[18px]" stroke={1.8} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#fcc4c8]/40 bg-white/70 text-brand-black/60 shadow-sm transition duration-300 hover:scale-105 hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8] hover:text-brand-black cursor-pointer"
              >
                <IconBrandFacebook className="h-[18px] w-[18px]" stroke={1.8} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#fcc4c8]/40 bg-white/70 text-brand-black/60 shadow-sm transition duration-300 hover:scale-105 hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8] hover:text-brand-black cursor-pointer"
              >
                <IconBrandTiktok className="h-[18px] w-[18px]" stroke={1.8} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-black/45">
                {col.heading}
              </h4>
              <ul className="space-y-2.5 text-sm text-brand-black/60">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition duration-300 hover:text-[#fcc4c8] hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter subscription bar */}
        <div className="mt-14 flex flex-col gap-4 rounded-3xl border border-[#fcc4c8]/35 bg-white/95 p-6 shadow-[0_8px_32px_rgba(252,196,200,0.06)] backdrop-blur-md bg-gradient-to-r from-white to-[#fff5f6] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-bold text-brand-black uppercase tracking-wider">
              Subscribe to our newsletter
            </h4>
            <p className="mt-1 text-xs text-brand-black/45 font-semibold">
              Get updates on new arrivals, offers, and more.
            </p>
          </div>
          <form
            className="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full sm:w-auto"
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
              className="rounded-full border border-[#fcc4c8]/50 bg-white px-4 py-2.5 text-xs font-semibold text-brand-black focus:border-[#fcc4c8] focus:ring-2 focus:ring-[#fcc4c8]/20 focus:outline-none transition-all shadow-sm w-full sm:w-[240px]"
            />
            <button
              type="submit"
              className="rounded-full bg-[#fcc4c8] hover:bg-[#fcc4c8]/85 text-brand-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 transition-all duration-300 shadow-sm active:scale-95 cursor-pointer w-full sm:w-auto text-center"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-[#fcc4c8]/25 pt-6 text-xs text-brand-black/40 sm:flex-row sm:items-center sm:justify-between font-semibold">
          <p>© {new Date().getFullYear()} An‑Nisa. All rights reserved.</p>
          <p>Handcrafted with care in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
