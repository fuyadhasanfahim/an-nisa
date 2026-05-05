import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { productSchema } from "@/lib/validators/product.schema";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  );
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = productSchema.parse(json);

    const created = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        priceCents: Math.round(input.price * 100),
        currency: "BDT",
        images: input.images ?? [],
        isActive: input.status === "active",
      },
    });

    return NextResponse.json({
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: err.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

