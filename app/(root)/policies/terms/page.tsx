import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { IconHourglass, IconScale, IconTruck, IconVariable } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Terms of Service — An-Nisa's World | Premium Handmade Embroidery",
  description:
    "Review the terms and conditions for An-Nisa's World boutique. Read handcrafted slow-fashion timelines, sizing agreements, and custom tailoring clauses.",
};

export default function BoutiquePolicyTerms() {
  return (
    <main className="flex-1 bg-white" id="terms-of-service-main">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fffbfa] to-white py-20 lg:py-24" id="terms-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcc4c8]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-black border border-[#fcc4c8]/30">
              <IconScale className="h-3.5 w-3.5 text-brand-black/60" />
              Agreement
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-brand-black leading-tight">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-black/50 font-semibold max-w-xl mx-auto leading-relaxed">
              By choosing An-Nisa&apos;s World, you support traditional craftsmanship, ethical slow fashion, and unique handwork.
            </p>
          </div>
        </Container>
      </section>

      {/* Main content sections */}
      <section className="py-12 sm:py-16 border-t border-[#fcc4c8]/10" id="terms-content">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:items-start">
            {/* Quick overview sticky card */}
            <div className="rounded-3xl stitch-border bg-gradient-to-br from-[#fffbfa] to-white p-8 shadow-softSm space-y-6 lg:sticky lg:top-28">
              <div className="bg-[#fcc4c8] px-4 py-2 border border-[#fcc4c8]/10 inline-block rounded-md shadow-sm select-none">
                <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-brand-black leading-none">
                  An Nisa&apos;s World
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-black">Our Brand Philosophy</h3>
              <p className="text-xs leading-relaxed text-black/55 font-semibold">
                Slow fashion takes time. Hand-embroidered details and custom cuts require dedicated attention to meet our premium standards.
              </p>
              <div className="border-t border-[#fcc4c8]/20 pt-4 space-y-2.5 text-xs text-brand-black/50">
                <div className="flex items-center gap-2 font-semibold">
                  <IconHourglass className="h-4 w-4 text-[#fcc4c8]" />
                  <span>Dedicated Production Times</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <IconVariable className="h-4 w-4 text-[#fcc4c8]" />
                  <span>Unique Handmade Hallmarks</span>
                </div>
              </div>
            </div>

            {/* Detailed sections */}
            <div className="space-y-10 text-sm sm:text-base leading-relaxed text-black/75">
              {/* Section 1 */}
              <div className="space-y-3" id="sec-handwork-timelines">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconHourglass className="h-5 w-5" stroke={2} />
                  <h2 className="font-serif text-xl font-bold text-brand-black">1. Production & Stitching Timelines</h2>
                </div>
                <p>
                  As a premium slow-fashion boutique, we refuse rushed industrial shortcuts. Because our embroidery is handcrafted and our abayas are bespoke-tailored, our standard production timelines require <strong>7 to 15 business days</strong> to ensure ultimate quality before shipping.
                </p>
                <p>
                  For highly complex, fully embroidered bridal or festive collections, timelines will be personally calibrated with you at the moment of order confirmation.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-3" id="sec-handmade-variations">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconVariable className="h-5 w-5" stroke={2} />
                  <h2 className="font-serif text-xl font-bold text-brand-black">2. Handmade Characteristics</h2>
                </div>
                <p>
                  Slight, subtle variations in embroidery patterns, thread shades, and stitching are the true hallmarks of authentic, hand-crafted nakshi-kantha and boutique embroidery. These minor variations are not considered flaws, but rather make each piece an irreplaceable, one-of-a-kind heirloom.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-3" id="sec-custom-sizing">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconScale className="h-5 w-5" stroke={2} />
                  <h2 className="font-serif text-xl font-bold text-brand-black">3. Sizing & Custom Fits</h2>
                </div>
                <p>
                  Customers are strictly required to double-check their sizes using our standard size charts before placing an order.
                </p>
                <p>
                  If you submit custom dimensions for a bespoke tailoring order, our head tailors will follow your exact measurements. We are not responsible for fitting errors resulting from inaccurate client-provided measurements.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-3" id="sec-delivery">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconTruck className="h-5 w-5" stroke={2} />
                  <h2 className="font-serif text-xl font-bold text-brand-black">4. Delivery across Bangladesh</h2>
                </div>
                <p>
                  We offer nationwide secure shipping. Once your custom dress is completed and passes our internal quality audits, standard delivery takes <strong>2 to 3 business days</strong> inside Dhaka, and <strong>3 to 5 business days</strong> outside Dhaka.
                </p>
                <p>
                  For deeper counsel or legal enquiries, reach us anytime at <a href="mailto:legal@annisa.world" className="text-brand-pink underline hover:text-brand-black font-semibold">legal@annisa.world</a>.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
