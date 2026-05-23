import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { BoutiqueContactForm } from "@/components/shop/BoutiqueContactForm";
import { IconMail, IconPhone, IconClock, IconMapPin } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Contact Us — An-Nisa's World | Premium Handmade Embroidery",
  description:
    "Get in touch with An-Nisa's World. Reach our concierge for custom tailoring support, embroidery adjustments, delivery coordination, and abaya fitting enquiries.",
};

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+880 1789-555666";
  const email = process.env.NEXT_PUBLIC_EMAIL || "support@annisa.world";

  return (
    <main className="flex-1 bg-white" id="contact-page-main">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fffbfa] to-white py-20 lg:py-24" id="contact-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcc4c8]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-black border border-[#fcc4c8]/30">
              Concierge
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-brand-black leading-tight">
              Get in Touch
            </h1>
            <p className="text-sm sm:text-base text-black/50 font-semibold max-w-xl mx-auto leading-relaxed">
              Whether you need to discuss custom measurements, request embroidery adjustments, or track an order, we are here to guide you.
            </p>
          </div>
        </Container>
      </section>

      {/* Main content grid */}
      <section className="py-12 sm:py-16 border-t border-[#fcc4c8]/10" id="contact-content">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            {/* Contact details list */}
            <div className="space-y-6">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-black" id="contact-info-heading">
                Contact Information
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-black/60 font-semibold">
                Our concierge service is dedicated to slow fashion perfection. You can reach out directly via our official channels below or drop us a message using the form.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 pt-4">
                {/* Phone Card */}
                <div className="flex gap-4 rounded-2xl bg-[#fffbfa]/80 p-5 border border-[#fcc4c8]/20 shadow-sm" id="info-phone">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fcc4c8]/25 text-brand-black">
                    <IconPhone className="h-5 w-5" stroke={1.8} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-black/45">Call/WhatsApp</div>
                    <a href={`tel:${phone}`} className="mt-1 block text-sm font-bold text-brand-black hover:text-brand-pink transition">
                      {phone}
                    </a>
                  </div>
                </div>

                {/* Email Card */}
                <div className="flex gap-4 rounded-2xl bg-[#fffbfa]/80 p-5 border border-[#fcc4c8]/20 shadow-sm" id="info-email">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fcc4c8]/25 text-brand-black">
                    <IconMail className="h-5 w-5" stroke={1.8} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-black/45">Email</div>
                    <a href={`mailto:${email}`} className="mt-1 block text-sm font-bold text-brand-black hover:text-brand-pink transition">
                      {email}
                    </a>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="flex gap-4 rounded-2xl bg-[#fffbfa]/80 p-5 border border-[#fcc4c8]/20 shadow-sm" id="info-hours">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fcc4c8]/25 text-brand-black">
                    <IconClock className="h-5 w-5" stroke={1.8} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-black/45">Boutique Hours</div>
                    <div className="mt-1 text-sm font-bold text-brand-black">
                      Sat — Thu: 10:00 AM - 8:00 PM
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="flex gap-4 rounded-2xl bg-[#fffbfa]/80 p-5 border border-[#fcc4c8]/20 shadow-sm" id="info-location">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fcc4c8]/25 text-brand-black">
                    <IconMapPin className="h-5 w-5" stroke={1.8} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-black/45">Boutique Studio</div>
                    <div className="mt-1 text-sm font-bold text-brand-black leading-relaxed">
                      Dhaka, Bangladesh (Handcrafted Heritage)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Interactive Contact Form */}
            <BoutiqueContactForm defaultSubject="General Concierge Enquiry" />
          </div>
        </Container>
      </section>
    </main>
  );
}
