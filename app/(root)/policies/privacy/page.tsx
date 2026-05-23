import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { IconDatabase, IconEyeOff, IconLock, IconShieldCheck } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Privacy Policy — An-Nisa's World | Premium Handmade Embroidery",
  description:
    "Learn how we secure your data, custom tailoring body measurements, and payment information at An-Nisa's World boutique.",
};

export default function BoutiquePolicyPrivacy() {
  return (
    <main className="flex-1 bg-white" id="privacy-policy-main">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fffbfa] to-white py-20 lg:py-24" id="privacy-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcc4c8]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-black border border-[#fcc4c8]/30">
              <IconShieldCheck className="h-3.5 w-3.5 text-brand-black/60" />
              Confidentiality
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-brand-black leading-tight">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-black/50 font-semibold max-w-xl mx-auto leading-relaxed">
              We cherish your softness, your custom fit, and your personal data alike. Here is how we safeguard your information.
            </p>
          </div>
        </Container>
      </section>

      {/* Main content sections */}
      <section className="py-12 sm:py-16 border-t border-[#fcc4c8]/10" id="privacy-content">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:items-start">
            {/* Quick overview sticky card */}
            <div className="rounded-3xl stitch-border bg-gradient-to-br from-[#fffbfa] to-white p-8 shadow-softSm space-y-6 lg:sticky lg:top-28">
              <div className="bg-[#fcc4c8] px-4 py-2 border border-[#fcc4c8]/10 inline-block rounded-md shadow-sm select-none">
                <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-brand-black leading-none">
                  An Nisa&apos;s World
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-black">Our Privacy Promise</h3>
              <p className="text-xs leading-relaxed text-black/55 font-semibold">
                We collect only what is strictly necessary to deliver a flawless, custom-tailored slow fashion experience. Your measurements and payments are heavily protected.
              </p>
              <div className="border-t border-[#fcc4c8]/20 pt-4 space-y-2.5 text-xs text-brand-black/50">
                <div className="flex items-center gap-2 font-semibold">
                  <IconLock className="h-4 w-4 text-[#fcc4c8]" />
                  <span>Secure 256-bit SSL</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <IconEyeOff className="h-4 w-4 text-[#fcc4c8]" />
                  <span>Zero Third-Party Sharing</span>
                </div>
              </div>
            </div>

            {/* Detailed sections */}
            <div className="space-y-10 text-sm sm:text-base leading-relaxed text-black/75">
              {/* Section 1 */}
              <div className="space-y-3" id="sec-data-collection">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconDatabase className="h-5 w-5" stroke={2} />
                  <h2 className="font-serif text-xl font-bold text-brand-black">1. What We Collect</h2>
                </div>
                <p>
                  To fulfill your premium orders, we collect standard account profiles (name, email, delivery address, phone number) along with highly specific bespoke metrics:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1.5 font-semibold text-black/60 text-xs sm:text-sm">
                  <li>Custom Body Measurements (bust, shoulder, waist, height, etc.).</li>
                  <li>Bespoke Tailoring Design Choices (fabric preferences, thread shades, sleeve styles).</li>
                  <li>Secure Payment logs (bKash/Nagad transactions, card, or cash-on-delivery records).</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="space-y-3" id="sec-data-usage">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconShieldCheck className="h-5 w-5" stroke={2} />
                  <h2 className="font-serif text-xl font-bold text-brand-black">2. How We Guard Your Data</h2>
                </div>
                <p>
                  Your measurements and bespoke dress sketches are strictly guarded within our secure administrative panel and are only accessible by our dedicated female head tailors to execute your commissions.
                </p>
                <p>
                  We utilize top-tier database hashing and secure transaction processes to ensure that your financial details are never stored directly on our servers.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-3" id="sec-user-rights">
                <div className="flex items-center gap-2 text-[#fcc4c8]">
                  <IconLock className="h-5 w-5" stroke={2} />
                  <h2 className="font-serif text-xl font-bold text-brand-black">3. Archiving & Your Rights</h2>
                </div>
                <p>
                  You retain complete authority over your creative profile. At any given moment, you can request our team to permanently edit, update, or completely archive your body measurements and tailoring logs.
                </p>
                <p>
                  For immediate assistance regarding privacy edits or data removal, please contact our concierge team at <a href="mailto:privacy@annisa.world" className="text-brand-pink underline hover:text-brand-black font-semibold">privacy@annisa.world</a>.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
