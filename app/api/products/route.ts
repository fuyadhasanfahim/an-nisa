import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { productSchema } from "@/lib/validators/product.schema";
import { normalizeProductListQuery } from "@/lib/validators/product-list.query";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = normalizeProductListQuery({
      q: searchParams.get("q") ?? "",
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const where: Prisma.ProductWhereInput =
      q.q.length > 0
        ? {
            OR: [
              { name: { contains: q.q, mode: "insensitive" } },
              { slug: { contains: q.q, mode: "insensitive" } },
              { sku: { contains: q.q, mode: "insensitive" } },
            ],
          }
        : {};

    const orderBy = { [q.sort]: q.order } as Prisma.ProductOrderByWithRelationInput;

    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / q.limit));
    const page = Math.min(Math.max(1, q.page), totalPages);
    const skip = (page - 1) * q.limit;

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: q.limit,
    });

    return NextResponse.json({
      items: products.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      page,
      limit: q.limit,
      totalPages,
      sort: q.sort,
      order: q.order,
      q: q.q,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to list products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = productSchema.parse(json);

    const created = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        description: input.description ?? null,
        priceCents: Math.round(input.price * 100),
        discountPriceCents:
          input.discountPrice != null && Number.isFinite(input.discountPrice)
            ? Math.round(input.discountPrice * 100)
            : null,
        currency: "BDT",
        images: input.images ?? [],
        isActive: input.status === "active",
        stockQuantity: input.stockQuantity,
        trackInventory: input.trackInventory,
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

