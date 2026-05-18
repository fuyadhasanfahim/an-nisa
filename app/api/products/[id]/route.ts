import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  productPatchSchema,
  productSchema,
  productInputToPersist,
} from "@/lib/validators/product.schema";
import { z } from "zod";

export const runtime = "nodejs";

function serializeProduct(p: Prisma.ProductGetPayload<object>) {
  return {
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    effectivePriceCents: p.discountPriceCents ?? p.priceCents,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serializeProduct(product));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = productSchema.parse(json);
    const input = productInputToPersist(parsed);

    const discountPriceCents =
      input.discountPrice != null && Number.isFinite(input.discountPrice)
        ? Math.round(input.discountPrice * 100)
        : null;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        description: input.description ?? null,
        priceCents: Math.round(input.price * 100),
        discountPriceCents,
        images: input.images ?? [],
        isActive: input.status === "active",
        stockQuantity: input.stockQuantity,
        trackInventory: input.trackInventory,
        category: input.category,
        tags: input.tags,
        brand: input.brand ?? null,
        sizes: input.sizes,
        colors: input.colors,
        fabricType: input.fabricType ?? null,
        embroideryType: input.embroideryType ?? null,
        ratingAverage: input.ratingAverage,
        ratingCount: input.ratingCount,
        showInHero: input.showInHero,
        featured: input.featured,
        isTopRated: input.isTopRated,
        isCombo: input.isCombo,
        trending: input.trending,
        handmade: input.handmade,
        boutiquePick: input.boutiquePick,
        newArrival: input.newArrival,
      },
    });

    return NextResponse.json(serializeProduct(updated));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json();
    const body = productPatchSchema.parse(json);

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: body.isActive },
    });

    return NextResponse.json(serializeProduct(updated));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error:
            "This product cannot be deleted while it is linked to existing orders.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
