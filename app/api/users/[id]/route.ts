import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCustomerUpdateSchema } from "@/lib/validators/customer-admin.schema";
import { mapAdminCustomerDto } from "@/lib/users/map-admin-customer";
import { ensureCustomerPublicId } from "@/lib/ids/public-ref";

export const runtime = "nodejs";

async function loadCustomerAdmin(id: string) {
  const row = await prisma.user.findFirst({
    where: { id, role: "user" },
    select: {
      id: true,
      name: true,
      email: true,
      banned: true,
    },
  });
  if (!row) return null;
  await ensureCustomerPublicId(prisma, row.id);
  const profileRow = await prisma.customerProfile.findUnique({
    where: { userId: row.id },
    select: {
      publicCustomerId: true,
      phone: true,
      address: true,
      city: true,
      country: true,
    },
  });
  return mapAdminCustomerDto({
    id: row.id,
    name: row.name,
    email: row.email,
    banned: row.banned,
    customers: profileRow,
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const { id } = await params;
  const dto = await loadCustomerAdmin(id);
  if (!dto) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(dto);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const session = authResult;
  const { id } = await params;

  if (session.user.id === id) {
    return NextResponse.json(
      { error: "You cannot modify your own account here" },
      { status: 400 },
    );
  }

  try {
    const json = await req.json();
    const patch = adminCustomerUpdateSchema.parse(json);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No changes provided" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "user" },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (patch.email) {
      const email = patch.email.trim().toLowerCase();
      const clash = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json(
          { error: "Another account already uses this email" },
          { status: 409 },
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      const userData: {
        name?: string;
        email?: string;
        banned?: boolean;
        updatedAt: Date;
      } = { updatedAt: new Date() };
      if (patch.name !== undefined) userData.name = patch.name.trim();
      if (patch.email !== undefined) {
        userData.email = patch.email.trim().toLowerCase();
      }
      if (patch.banned !== undefined) userData.banned = patch.banned;

      await tx.user.update({
        where: { id },
        data: userData,
      });

      if (patch.banned === true) {
        await tx.session.deleteMany({ where: { userId: id } });
      }

      const profilePatch: {
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        country?: string | null;
      } = {};
      if (patch.phone !== undefined) profilePatch.phone = patch.phone ?? null;
      if (patch.address !== undefined) {
        profilePatch.address = patch.address ?? null;
      }
      if (patch.city !== undefined) profilePatch.city = patch.city ?? null;
      if (patch.country !== undefined) {
        profilePatch.country = patch.country ?? null;
      }

      if (Object.keys(profilePatch).length > 0) {
        await tx.customerProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            phone: profilePatch.phone ?? null,
            address: profilePatch.address ?? null,
            city: profilePatch.city ?? null,
            country: profilePatch.country ?? "BD",
          },
          update: profilePatch,
        });
      }

      await ensureCustomerPublicId(tx, id);
    });

    const dto = await loadCustomerAdmin(id);
    if (!dto) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(dto);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const session = authResult;
  const { id } = await params;

  if (session.user.id === id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  try {
    const row = await prisma.user.findFirst({
      where: { id, role: "user" },
      select: { id: true },
    });
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [orders, invoices] = await Promise.all([
      prisma.order.count({ where: { userId: id } }),
      prisma.invoice.count({ where: { userId: id } }),
    ]);
    if (orders > 0 || invoices > 0) {
      return NextResponse.json(
        {
          error:
            "This customer has orders or invoices. Remove or reassign them before deleting.",
        },
        { status: 409 },
      );
    }

    await prisma.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
