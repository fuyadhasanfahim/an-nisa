import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") ?? "")
      .trim()
      .slice(0, 120);
    let limit = Number(searchParams.get("limit") ?? 30);
    if (!Number.isFinite(limit) || limit < 1) limit = 30;
    limit = Math.min(Math.floor(limit), 50);

    const where: Prisma.UserWhereInput =
      q.length > 0
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ items: users });
  } catch {
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 }
    );
  }
}
