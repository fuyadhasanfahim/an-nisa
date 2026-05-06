import { auth, type Session } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function requireAdminSession(
  req: Request
): Promise<Session | NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export function isNextResponse(v: Session | NextResponse): v is NextResponse {
  return v instanceof NextResponse;
}
