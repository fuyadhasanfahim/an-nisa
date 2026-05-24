import { Container } from "@/components/shared/Container";

export default function ProductLoading() {
  return (
    <main className="flex-1 bg-[radial-gradient(circle,_rgba(252,196,200,0.22),transparent_65%)] py-14 dark:bg-[radial-gradient(circle,_rgba(255,255,255,0.12),transparent_70%)]">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.06fr_minmax(0,0.9fr)] animate-pulse">
          {/* Studio Image Showcase Skeleton */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] border border-[#fcc4c8]/20 bg-black/5 shadow-sm backdrop-blur-sm">
            {/* Thumbnails skeleton */}
            <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-black/20 via-transparent p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-16 shrink-0 rounded-xl bg-black/10" />
              ))}
            </div>
          </div>

          {/* Product Information Skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-black/10" />
              <div className="h-10 w-3/4 rounded bg-black/10" />
              <div className="h-5 w-1/3 rounded bg-black/10 mt-2" />
            </div>

            <div className="flex gap-x-6 gap-y-2">
              <div className="h-4 w-24 rounded bg-black/10" />
              <div className="h-4 w-32 rounded bg-black/10" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-black/10" />
              <div className="h-4 w-5/6 rounded bg-black/10" />
              <div className="h-4 w-4/6 rounded bg-black/10" />
            </div>

            {/* Premium Tariff Glass Card Skeleton */}
            <div className="rounded-2xl border border-[#fcc4c8]/35 bg-white p-5 shadow-[0_12px_40px_rgba(252,196,200,0.12)]">
              <div className="h-3 w-24 rounded bg-black/10" />
              <div className="mt-3 h-8 w-32 rounded bg-black/10" />
            </div>

            {/* Sizes Selector Skeleton */}
            <div className="space-y-2.5">
              <div className="h-3 w-20 rounded bg-black/10" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-16 rounded-full bg-black/10" />
                ))}
              </div>
            </div>

            {/* Colors Selector Skeleton */}
            <div className="space-y-2.5">
              <div className="h-3 w-20 rounded bg-black/10" />
              <div className="flex flex-wrap gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-8 w-20 rounded-full bg-black/10" />
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="h-12 w-40 rounded-full bg-black/10" />
              <div className="h-12 flex-1 rounded-full bg-black/10" />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
