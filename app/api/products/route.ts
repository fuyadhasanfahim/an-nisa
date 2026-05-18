import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import {
  productSchema,
  productInputToPersist,
} from "@/lib/validators/product.schema";
import {
  normalizeProductListQuery,
  orderByFromSortMode,
  productFiltersFromSearchParams,
} from "@/lib/validators/product-list.query";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { publicProductId } from "@/lib/ids/public-ref";
import { getSessionFromRequest } from "@/lib/auth/get-session";
import { buildProductWhere } from "@/lib/products/product-list-where";

export const runtime = "nodejs";

function serializeProduct(p: Prisma.ProductGetPayload<object>) {
  return {
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    effectivePriceCents: p.discountPriceCents ?? p.priceCents,
  };
}

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const isAdmin = session?.user?.role === "admin";

    const { searchParams } = new URL(req.url);
    const q = normalizeProductListQuery({
      q: searchParams.get("q") ?? "",
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      sortMode: searchParams.get("sortMode") ?? undefined,
    });

    const filters = productFiltersFromSearchParams(searchParams);
    const includeInactive = Boolean(isAdmin && filters.includeInactive);
    const requireActive = !includeInactive;

    const where = buildProductWhere({
      q: q.q,
      filters,
      requireActive,
    });

    const ob = orderByFromSortMode(q.sortMode, { sort: q.sort, order: q.order });
    const orderBy = {
      [ob.field]: ob.order,
    } as Prisma.ProductOrderByWithRelationInput;

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
      items: products.map(serializeProduct),
      total,
      page,
      limit: q.limit,
      totalPages,
      sort: ob.field,
      order: ob.order,
      sortMode: q.sortMode ?? null,
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
    const parsed = productSchema.parse(json);
    const input = productInputToPersist(parsed);

    const discountPriceCents =
      input.discountPrice != null && Number.isFinite(input.discountPrice)
        ? Math.round(input.discountPrice * 100)
        : null;

    for (let attempt = 0; attempt < 25; attempt++) {
      try {
        const created = await prisma.product.create({
          data: {
            id: publicProductId(),
            name: input.name,
            slug: input.slug,
            sku: input.sku,
            description: input.description ?? null,
            priceCents: Math.round(input.price * 100),
            discountPriceCents,
            currency: "BDT",
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

        return NextResponse.json(serializeProduct(created));
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          continue;
        }
        throw err;
      }
    }

    return NextResponse.json(
      { error: "Could not allocate product id" },
      { status: 500 }
    );
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
