import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { BoutiqueContactForm } from "@/components/shop/BoutiqueContactForm";
import { IconHourglass, IconShieldCheck, IconTruck } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery — An-Nisa's World | Premium Handmade Embroidery",
  description:
    "Review shipping methods, packaging, delivery times inside/outside Dhaka, and inquire about order tracking at An-Nisa's World boutique.",
};

export default function BoutiqueShippingPolicy() {
  return (
    <main className="flex-1 bg-white" id="shipping-policy-main">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fffbfa] to-white py-20 lg:py-24" id="shipping-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcc4c8]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-black border border-[#fcc4c8]/30">
              <IconTruck className="h-3.5 w-3.5 text-brand-black/60" />
              Dispatch Details
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-brand-black leading-tight">
              Shipping & Delivery
            </h1>
            <p className="text-sm sm:text-base text-black/50 font-semibold max-w-xl mx-auto leading-relaxed">
              We pack and ship our handcrafted designs with pure care and choreography. Learn about our delivery times.
            </p>
          </div>
        </Container>
      </section>

      {/* Main content layout */}
      <section className="py-12 sm:py-16 border-t border-[#fcc4c8]/10" id="shipping-content">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            {/* Story & terms details */}
            <div className="space-y-10 text-sm sm:text-base leading-relaxed text-black/75">
              <div className="space-y-3" id="shipping-intro">
                <h2 className="font-serif text-2xl font-bold text-brand-black">Tactile Premium Packaging</h2>
                <p>
                  Each piece of heirloom custom embroidery is delicately steamed, scented, and folded into tissue paper before being placed in our signature custom tactile boxes. We ensure that the package arrives in pristine condition.
                </p>
              </div>

              {/* Delivery Timeline info cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#fffbfa] p-5 border border-[#fcc4c8]/20 shadow-sm" id="timeline-dhaka">
                  <div className="text-xs font-bold uppercase tracking-wider text-black/45">Inside Dhaka</div>
                  <div className="mt-2 font-serif text-2xl font-bold text-brand-black">2 - 3 Days</div>
                  <p className="mt-1 text-xs text-black/50 font-semibold">Standard courier delivery after production completion.</p>
                </div>
                <div className="rounded-2xl bg-[#fffbfa] p-5 border border-[#fcc4c8]/20 shadow-sm" id="timeline-outside">
                  <div className="text-xs font-bold uppercase tracking-wider text-black/45">Outside Dhaka</div>
                  <div className="mt-2 font-serif text-2xl font-bold text-brand-black">3 - 5 Days</div>
                  <p className="mt-1 text-xs text-black/50 font-semibold">Nationwide shipping via trusted express courier partners.</p>
                </div>
              </div>

              <div className="space-y-3" id="shipping-timelines">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconHourglass className="h-5 w-5" stroke={2} />
                  <h3 className="font-serif text-lg font-bold text-brand-black">Production Time Requirements</h3>
                </div>
                <p>
                  Please remember that our premium abayas and bespoke embroidery dresses are tailored from scratch. Standard production requires <strong>7 to 15 business days</strong> depending on the details. Your delivery timeline starts immediately after the production is completed.
                </p>
              </div>

              <div className="space-y-3" id="shipping-sec">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconShieldCheck className="h-5 w-5" stroke={2} />
                  <h3 className="font-serif text-lg font-bold text-brand-black">Secure Delivery Guarantee</h3>
                </div>
                <p>
                  To secure your order, we work only with courier partners who have been strictly trained to handle delicate premium garments. Once dispatched, a stable tracking ID will be shared with you to trace your box&apos;s journey.
                </p>
              </div>
            </div>

            {/* Embedded Enquiry form CTA */}
            <BoutiqueContactForm defaultSubject="Shipping & Tracking Enquiry" />
          </div>
        </Container>
      </section>
    </main>
  );
}
