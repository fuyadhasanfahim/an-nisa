import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";

const highlights = [
  {
    title: "Refined stitching",
    body: "Clean lines and balanced tension—built to feel premium up close and from a distance.",
  },
  {
    title: "Made for everyday wear",
    body: "Thoughtful fabric choices and finishes that stay comfortable through long days.",
  },
  {
    title: "Custom-friendly",
    body: "Bring a motif, palette, or moodboard—we translate it into embroidery you can wear.",
  },
];

const steps = [
  { step: "01", title: "Tell us the vision", detail: "Share ideas, sizing notes, and deadlines." },
  { step: "02", title: "We stitch & refine", detail: "Sampling, tweaks, then careful production." },
  { step: "03", title: "Delivered with care", detail: "Packed neatly—ready to gift or wear." },
];

export default function Home() {
  return (
    <main className="flex-1 bg-white">
      <Container>
        <section className="grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs text-black/70 stitch-border">
              Premium embroidery • minimal • elegant
            </p>
            <h1 className="font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl">
              Soft details. Strong craft.
              <span className="text-black/70"> Made for her.</span>
            </h1>
            <p className="max-w-prose text-base leading-7 text-black/65">
              An-Nisa offers premium embroidery services and curated pieces—designed with calm
              confidence, finished with meticulous stitching.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/shop">
                <Button>Explore shop</Button>
              </Link>
              <Link href="/custom-order">
                <Button variant="ghost" className="stitch-border">
                  Request custom order
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl bg-white shadow-soft p-6 stitch-border">
              <div className="stitch-glow animate-stitch rounded-xl p-6">
                <div className="rounded-xl bg-white/85 p-6 backdrop-blur">
                  <div className="font-serif text-xl tracking-tight">Signature finishing</div>
                  <div className="mt-2 text-sm text-black/65">
                    Dashed borders mimic hand-stitching. Subtle motion adds a premium feel without
                    noise.
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl stitch-border bg-white p-4">
                      <div className="text-xs text-black/60">Primary</div>
                      <div className="mt-2 h-8 rounded-lg bg-[#fcc4c8]" />
                    </div>
                    <div className="rounded-xl stitch-border bg-white p-4">
                      <div className="text-xs text-black/60">Contrast</div>
                      <div className="mt-2 h-8 rounded-lg bg-[#0b0b0f]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#fcc4c8]/35 blur-2xl" />
            <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />
          </div>
        </section>

        <section className="border-t border-black/5 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
              Quiet luxury, stitched by hand
            </h2>
            <p className="mt-3 text-sm leading-7 text-black/65 md:text-base">
              Each piece balances softness and structure—so embroidery reads intentional, never loud.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-xl stitch-border bg-white p-6 shadow-softSm transition hover:shadow-soft"
              >
                <h3 className="font-medium text-brand-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-black/65">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-black/5 py-16 md:py-20">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-lg">
              <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                How it works
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">
                From conversation to cloth
              </h2>
              <p className="mt-3 text-sm leading-7 text-black/65 md:text-base">
                Whether you choose something ready-made or fully custom, the same calm process
                applies—clear updates, gentle timelines, careful finishing.
              </p>
            </div>
            <Link href="/custom-order">
              <Button variant="ghost" className="stitch-border shrink-0">
                Start a custom thread
              </Button>
            </Link>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <li
                key={s.step}
                className="relative rounded-2xl bg-[#f9fafb] p-6 ring-1 ring-black/5"
              >
                <span className="text-xs font-medium text-black/45">{s.step}</span>
                <div className="mt-3 font-medium text-brand-black">{s.title}</div>
                <p className="mt-2 text-sm leading-7 text-black/65">{s.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-black/5 py-16 md:py-24">
          <div className="relative overflow-hidden rounded-2xl bg-brand-black px-8 py-12 text-white md:px-14 md:py-16">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-pink/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
                Ready when you are
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/75 md:text-base">
                Browse the shop for curated picks—or tell us what you want stitched from scratch.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/shop">
                  <Button className="bg-brand-pink text-brand-black hover:bg-brand-pink/90">
                    Shop the collection
                  </Button>
                </Link>
                <Link href="/custom-order">
                  <Button
                    variant="ghost"
                    className="border border-white/25 text-white hover:bg-white/10"
                  >
                    Book a custom order
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
