import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { BoutiqueContactForm } from "@/components/shop/BoutiqueContactForm";
import { IconHourglass, IconScale, IconShieldCheck } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Returns & Exchange — An-Nisa's World | Premium Handmade Embroidery",
  description:
    "Understand return conditions, size exchanges, and custom-tailored silhouette adjustments at An-Nisa's World boutique.",
};

export default function BoutiqueReturnsPolicy() {
  return (
    <main className="flex-1 bg-white" id="returns-policy-main">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fffbfa] to-white py-20 lg:py-24" id="returns-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcc4c8]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-black border border-[#fcc4c8]/30">
              <IconScale className="h-3.5 w-3.5 text-brand-black/60" />
              Sizing Support
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-brand-black leading-tight">
              Returns & Exchange
            </h1>
            <p className="text-sm sm:text-base text-black/50 font-semibold max-w-xl mx-auto leading-relaxed">
              Our handcrafted pieces are delicately tailored for you. Read our returns and exchange conditions.
            </p>
          </div>
        </Container>
      </section>

      {/* Main content layout */}
      <section className="py-12 sm:py-16 border-t border-[#fcc4c8]/10" id="returns-content">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            {/* Story & terms details */}
            <div className="space-y-10 text-sm sm:text-base leading-relaxed text-black/75">
              <div className="space-y-3" id="returns-intro">
                <h2 className="font-serif text-2xl font-bold text-brand-black">Intimately Custom Sizing</h2>
                <p>
                  Because every single piece of embroidery is uniquely hand-stitched and tailored to specific orders, we encourage you to carefully double-check your sizing metrics against our custom size charts before final purchase.
                </p>
              </div>

              {/* Policy cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#fffbfa] p-5 border border-[#fcc4c8]/20 shadow-sm" id="policy-window">
                  <div className="text-xs font-bold uppercase tracking-wider text-black/45">Review Window</div>
                  <div className="mt-2 font-serif text-2xl font-bold text-brand-black">72 Hours</div>
                  <p className="mt-1 text-xs text-black/50 font-semibold">Report sizing misalignments within 72 hours of receiving.</p>
                </div>
                <div className="rounded-2xl bg-[#fffbfa] p-5 border border-[#fcc4c8]/20 shadow-sm" id="policy-bespoke">
                  <div className="text-xs font-bold uppercase tracking-wider text-black/45">Bespoke Orders</div>
                  <div className="mt-2 font-serif text-2xl font-bold text-brand-black">Lovingly Final</div>
                  <p className="mt-1 text-xs text-black/50 font-semibold">Bespoke custom-fits are final unless structural defect occurs.</p>
                </div>
              </div>

              <div className="space-y-3" id="returns-details">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconHourglass className="h-5 w-5" stroke={2} />
                  <h3 className="font-serif text-lg font-bold text-brand-black">How to Exchange</h3>
                </div>
                <p>
                  Should your standard boutique silhouette feel slightly misaligned, please notify our team within 72 hours. We will cordially coordinate an exchange for the correct size. The item must remain unworn, unaltered, and with all custom tags securely attached.
                </p>
              </div>

              <div className="space-y-3" id="returns-defects">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconShieldCheck className="h-5 w-5" stroke={2} />
                  <h3 className="font-serif text-lg font-bold text-brand-black">Craftsmanship Guarantee</h3>
                </div>
                <p>
                  We keep our needle honest. In the highly unlikely event that your dress suffers from a genuine handcrafting, sewing, or fabric defect, we will completely remake and replace the item for you with zero extra shipping charges.
                </p>
              </div>
            </div>

            {/* Embedded Enquiry form CTA */}
            <BoutiqueContactForm defaultSubject="Returns & Exchange Request" />
          </div>
        </Container>
      </section>
    </main>
  );
}
