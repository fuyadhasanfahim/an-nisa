import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { IconAward, IconHeart, IconSparkles, IconScissors } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "About Us — An-Nisa's World | Premium Handmade Embroidery",
  description:
    "Discover the story of An-Nisa's World. From our 1+ year offline journey of handcrafted premium embroidery and fashion, generating over ৳100,000+ in revenue, to our online boutique.",
};

export default function AboutUsPage() {
  return (
    <main className="flex-1 bg-white" id="about-us-main">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fffbfa] to-white py-20 lg:py-28" id="about-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcc4c8]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-black border border-[#fcc4c8]/30">
              <IconSparkles className="h-3.5 w-3.5 text-brand-black/60 animate-pulse" />
              Our Story
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-black leading-tight">
              Crafting Timeless <span className="underline decoration-[#fcc4c8] decoration-wavy decoration-2">Embroidery</span> & Elegance
            </h1>
            <p className="text-base sm:text-lg text-black/60 font-medium max-w-2xl mx-auto leading-relaxed">
              At An-Nisa&apos;s World, we bring traditional Bangladeshi artistry to life through premium, handcrafted women&apos;s embroidery, elegant abayas, and bespoke fashion.
            </p>
          </div>
        </Container>
      </section>

      {/* Narrative block */}
      <section className="py-12 sm:py-16" id="about-story">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Visual branding showcase card */}
            <div className="relative rounded-3xl stitch-border bg-gradient-to-br from-[#fffbfa] to-white p-8 sm:p-12 shadow-softSm flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="bg-[#fcc4c8] px-4 py-2 border border-[#fcc4c8]/10 inline-block rounded-md shadow-sm">
                  <span className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-brand-black leading-none">
                    An Nisa&apos;s World
                  </span>
                </div>
                <h3 className="mt-8 font-serif text-2xl font-bold text-brand-black">
                  Slow Fashion, Handcrafted with Infinite Love.
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-black/55 font-semibold">
                  Every thread is selected by hand, and every motif is woven with pure dedication. We bridge our rich cultural heritage with modern silhouettes to make you feel comfortable and graceful.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-black/45">
                <span>Handmade in Bangladesh</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#fcc4c8]" />
                <span>Bespoke Quality</span>
              </div>
            </div>

            {/* Typography story details */}
            <div className="space-y-6 text-sm sm:text-base leading-relaxed text-black/75">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-black" id="story-heading">
                Our Offline Roots
              </h2>
              <p>
                An-Nisa&apos;s World began as a small offline creative endeavor dedicated to reviving the delicate charm of traditional hand-embroidery. For over <strong>one complete year</strong>, we operated exclusively as a bespoke offline boutique in Bangladesh, closely collaborating with local female artisans to craft premium custom dresses, high-end abayas, and festive collections.
              </p>
              <p>
                During our offline tenure, we poured our heart and soul into delivering perfection. Through pure word-of-mouth and sheer passion for fabric quality, we successfully generated nearly <strong>৳100,000+ (প্রায় লক্ষাধিক টাকা) in revenue</strong>. More importantly, we earned the trust of over 150+ lovely customers who appreciated the intricate details of our threads.
              </p>
              <p>
                Now, we have embarked on our next chapter — translating our offline perfection into a seamless, modern online shopping experience. Every product featured in our boutique retains the exact same standard of premium fabrics and meticulous stitching that established our brand in the offline world.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats grid */}
      <section className="bg-gradient-to-r from-brand-cream/10 via-[#fff8f9] to-brand-cream/10 py-16 sm:py-20 border-y border-[#fcc4c8]/20" id="about-stats">
        <Container>
          <div className="grid gap-8 grid-cols-2 lg:grid-cols-4 text-center">
            <div className="space-y-2 p-4 rounded-2xl bg-white/70 border border-[#fcc4c8]/10 shadow-sm backdrop-blur-sm" id="stat-sales">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-brand-black">৳100K+</div>
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-black/45">Offline Revenue</div>
              <p className="text-[10px] text-black/40 font-semibold px-2">প্রায় লক্ষাধিক টাকার অফলাইন সেলস</p>
            </div>
            <div className="space-y-2 p-4 rounded-2xl bg-white/70 border border-[#fcc4c8]/10 shadow-sm backdrop-blur-sm" id="stat-experience">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-brand-black">1+ Year</div>
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-black/45">Offline Crafting</div>
              <p className="text-[10px] text-black/40 font-semibold px-2">অফলাইনে কাজের দীর্ঘ অভিজ্ঞতা</p>
            </div>
            <div className="space-y-2 p-4 rounded-2xl bg-white/70 border border-[#fcc4c8]/10 shadow-sm backdrop-blur-sm" id="stat-orders">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-brand-black">150+</div>
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-black/45">Custom Orders</div>
              <p className="text-[10px] text-black/40 font-semibold px-2">অফলাইনে ভালোবাসায় তৈরি পোশাক</p>
            </div>
            <div className="space-y-2 p-4 rounded-2xl bg-white/70 border border-[#fcc4c8]/10 shadow-sm backdrop-blur-sm" id="stat-handmade">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-brand-black">100%</div>
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-black/45">Handmade</div>
              <p className="text-[10px] text-black/40 font-semibold px-2">প্রতিটি সুতোয় জড়ানো মমতা</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Core values block */}
      <section className="py-20 lg:py-24" id="about-pillars">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-black">
              The Pillars of Our Craft
            </h2>
            <p className="text-sm sm:text-base text-black/50 font-semibold">
              Our work rests upon three core commitments to quality, authenticity, and ethical production.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Pillar 1 */}
            <article className="glass rounded-2xl p-6 sm:p-8 space-y-4 border border-[#fcc4c8]/25 bg-white/95 transition duration-500 hover:-translate-y-1 hover:shadow-softSm" id="pillar-craft">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fcc4c8]/25 text-brand-black">
                <IconScissors className="h-5 w-5" stroke={1.8} />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-black">Artisanal Craftsmanship</h3>
              <p className="text-sm leading-relaxed text-black/55 font-semibold">
                We refuse automated, mass-production embroidery. Every floral detail and stitch is crafted manually by our skilled women tailors using pure cotton, georgette, and linen materials.
              </p>
            </article>

            {/* Pillar 2 */}
            <article className="glass rounded-2xl p-6 sm:p-8 space-y-4 border border-[#fcc4c8]/25 bg-white/95 transition duration-500 hover:-translate-y-1 hover:shadow-softSm" id="pillar-empowerment">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fcc4c8]/25 text-brand-black">
                <IconHeart className="h-5 w-5" stroke={1.8} />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-black">Empowering Artisans</h3>
              <p className="text-sm leading-relaxed text-black/55 font-semibold">
                An-Nisa&apos;s World acts as a proud platform supporting local female tailors and artisans in Bangladesh. We believe in providing comfortable working environments and absolute fair trade wages.
              </p>
            </article>

            {/* Pillar 3 */}
            <article className="glass rounded-2xl p-6 sm:p-8 space-y-4 border border-[#fcc4c8]/25 bg-white/95 transition duration-500 hover:-translate-y-1 hover:shadow-softSm" id="pillar-heritage">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fcc4c8]/25 text-brand-black">
                <IconAward className="h-5 w-5" stroke={1.8} />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-black">Timeless Heritage</h3>
              <p className="text-sm leading-relaxed text-black/55 font-semibold">
                By blending age-old traditional stitches with modern silhouettes, we ensure that Bangladeshi embroidery remains relevant, fashionable, and globally appreciated by today&apos;s generation.
              </p>
            </article>
          </div>
        </Container>
      </section>
    </main>
  );
}
