import { Container } from "@/components/shared/Container";

export default function CustomOrderPage() {
  return (
    <main className="flex-1 bg-white">
      <Container>
        <div className="py-12">
          <h1 className="font-serif text-3xl tracking-tight">Custom order</h1>
          <p className="mt-2 text-sm text-black/65">
            Starter page for requesting bespoke embroidery.
          </p>

          <form className="mt-8 grid gap-4 rounded-xl stitch-border bg-white p-6 shadow-softSm md:max-w-xl">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Name</span>
              <input
                className="h-11 rounded-xl border border-black/10 px-3 outline-none focus:border-black/20 focus:ring-2 focus:ring-brand-pink/40"
                placeholder="Your name"
                name="name"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Email</span>
              <input
                className="h-11 rounded-xl border border-black/10 px-3 outline-none focus:border-black/20 focus:ring-2 focus:ring-brand-pink/40"
                placeholder="you@example.com"
                name="email"
                type="email"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Details</span>
              <textarea
                className="min-h-28 rounded-xl border border-black/10 px-3 py-2 outline-none focus:border-black/20 focus:ring-2 focus:ring-brand-pink/40"
                placeholder="Fabric, thread color, motif, size, deadline..."
                name="details"
              />
            </label>
            <button className="h-11 rounded-xl bg-brand-black text-sm font-medium text-white shadow-softSm transition hover:opacity-95 active:scale-[0.99]">
              Submit request
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}

