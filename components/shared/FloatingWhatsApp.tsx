"use client";

import { IconBrandWhatsapp } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function FloatingWhatsApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Retrieve raw phone number and sanitize for the WhatsApp wa.me API link
  const rawPhone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+8801799999999";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-soft font-bold transition-all duration-300 hover:scale-110 active:scale-95 group hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 cursor-pointer select-none"
      id="floating-whatsapp-chat"
    >
      {/* Dynamic pulse ping ring */}
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-25 duration-1000 group-hover:animate-none" />

      {/* Premium custom green shadow overlay */}
      <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-600/10 to-emerald-400/20 opacity-0 blur transition duration-300 group-hover:opacity-100" />

      <IconBrandWhatsapp className="relative z-10 h-7.5 w-7.5 transition-transform duration-300 group-hover:rotate-[8deg]" stroke={1.8} />

      {/* Floating tooltip */}
      <span className="absolute right-16 rounded-xl border border-emerald-500/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 shadow-softSm opacity-0 -translate-x-2 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
        Chat with us
      </span>
    </a>
  );
}
