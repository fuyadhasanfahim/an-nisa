import { Container } from "@/components/shared/Container";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="flex-1 bg-white">
      <Container>
        <div className="py-12">
          <h1 className="font-serif text-3xl tracking-tight">Product</h1>
          <p className="mt-2 text-sm text-black/65">
            Slug: <span className="font-mono">{slug}</span>
          </p>
          <div className="mt-8 rounded-xl stitch-border bg-white p-6 shadow-softSm">
            <div className="text-sm text-black/70">
              Replace this page with real product fetching via Prisma/RTKQ.
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

