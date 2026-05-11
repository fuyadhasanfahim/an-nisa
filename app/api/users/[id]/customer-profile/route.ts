import { prisma } from "@/lib/db/prisma";
import {
  requireAdminSession,
  isNextResponse,
} from "@/lib/auth/require-admin-api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminSession(req);
  if (isNextResponse(authResult)) return authResult;

  const { id } = await params;

  const profile = await prisma.customerProfile.findUnique({
    where: { userId: id },
    select: {
      phone: true,
      address: true,
      city: true,
      country: true,
    },
  });

  if (!profile) {
    return NextResponse.json(
      { phone: null, address: null, city: null, country: null },
      { status: 200 }
    );
  }

  return NextResponse.json({
    phone: profile.phone,
    address: profile.address,
    city: profile.city,
    country: profile.country ?? "BD",
  });
}
