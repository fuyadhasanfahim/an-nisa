import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { BoutiqueProductStudio } from "@/components/shop/BoutiqueProductStudio";
import type { BoutiqueProductStudioModel } from "@/components/shop/product-studio-model";
import { Container } from "@/components/shared/Container";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: { name: true, description: true, images: true },
  });

  return {
    title: product?.name ?? "Piece",
    description: product?.description ?? "Premium embroidery boutique piece.",
    openGraph: product?.images?.length
      ? {
          images: [{ url: product.images[0] }],
        }
      : undefined,
  };
}

export default async function BoutiqueProductSlugPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
  });

  if (!product) {
    notFound();
  }

  const model: BoutiqueProductStudioModel = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.priceCents,
    discountPriceCents: product.discountPriceCents,
    currency: product.currency,
    effectivePriceCents: product.discountPriceCents ?? product.priceCents,
    images: product.images,
    fabricType: product.fabricType,
    embroideryType: product.embroideryType,
    category: product.category,
    sizes: product.sizes,
  };

  return (
    <main className="flex-1 bg-[radial-gradient(circle,_rgba(252,196,200,0.22),transparent_65%)] py-14 dark:bg-[radial-gradient(circle,_rgba(255,255,255,0.12),transparent_70%)]">
      <Container>
        <BoutiqueProductStudio product={model} />
      </Container>
    </main>
  );
}
