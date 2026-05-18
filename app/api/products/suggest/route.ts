import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim().slice(0, 120);
    if (q.length < 2) {
      return NextResponse.json({ items: [] });
    }

    const tokens = [...new Set(q.split(/\s+/).filter(Boolean))].slice(0, 4);

    const items = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          ...(tokens.length ? [{ tags: { hasSome: tokens } }] : []),
        ],
      },
      take: 10,
      orderBy: [{ trending: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        images: true,
        priceCents: true,
        discountPriceCents: true,
        ratingAverage: true,
        ratingCount: true,
      },
    });

    return NextResponse.json({
      items: items.map((p) => ({
        ...p,
        effectivePriceCents: p.discountPriceCents ?? p.priceCents,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Suggest failed" }, { status: 500 });
  }
}
