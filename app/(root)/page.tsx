import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";

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
              An-Nisa offers premium embroidery services and curated pieces—
              designed with calm confidence, finished with meticulous stitching.
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
                  <div className="font-serif text-xl tracking-tight">
                    Signature finishing
                  </div>
                  <div className="mt-2 text-sm text-black/65">
                    Dashed borders mimic hand-stitching. Subtle motion adds a
                    premium feel without noise.
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
      </Container>
    </main>
  );
}
