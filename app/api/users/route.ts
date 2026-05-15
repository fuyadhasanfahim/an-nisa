import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { ensureCustomerPublicId } from "@/lib/ids/public-ref";
import {
  adminCustomerCreateSchema,
} from "@/lib/validators/customer-admin.schema";
import { mapAdminCustomerDto } from "@/lib/users/map-admin-customer";
import { z } from "zod";

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
    const excludeBanned = searchParams.get("excludeBanned") === "1";

    const searchWhere: Prisma.UserWhereInput =
      q.length > 0
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              {
                customers: {
                  publicCustomerId: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {};

    const where: Prisma.UserWhereInput = {
      role: "user",
      ...(excludeBanned ? { banned: false } : {}),
      ...(Object.keys(searchWhere).length > 0 ? searchWhere : {}),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        banned: true,
      },
    });

    const items = await Promise.all(
      users.map(async (u) => {
        await ensureCustomerPublicId(prisma, u.id);
        const profileRow = await prisma.customerProfile.findUnique({
          where: { userId: u.id },
          select: {
            publicCustomerId: true,
            phone: true,
            address: true,
            city: true,
            country: true,
          },
        });
        return mapAdminCustomerDto({
          id: u.id,
          name: u.name,
          email: u.email,
          banned: u.banned,
          customers: profileRow,
        });
      }),
    );

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  try {
    const json = await req.json();
    const input = adminCustomerCreateSchema.parse(json);
    const email = input.email.trim().toLowerCase();

    const dup = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (dup) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    const now = new Date();
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: crypto.randomUUID(),
          name: input.name.trim(),
          email,
          emailVerified: false,
          role: "user",
          banned: false,
          createdAt: now,
          updatedAt: now,
        },
      });
      await tx.customerProfile.create({
        data: {
          userId: user.id,
          phone: input.phone ?? null,
          address: input.address ?? null,
          city: input.city ?? null,
          country: input.country ?? "BD",
        },
      });
      await ensureCustomerPublicId(tx, user.id);
      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          banned: true,
          customers: {
            select: {
              publicCustomerId: true,
              phone: true,
              address: true,
              city: true,
              country: true,
            },
          },
        },
      });
    });

    return NextResponse.json(mapAdminCustomerDto(created), { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}
