import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const requestedPathRaw =
    h.get("next-url") ??
    h.get("x-next-url") ??
    h.get("x-invoke-path") ??
    "/admin";
  const requestedPath =
    requestedPathRaw.startsWith("/sign-in") || requestedPathRaw === "/"
      ? "/admin"
      : requestedPathRaw;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session)
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent(requestedPath)}&toast=auth-required`
    );

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { banned: true },
  });
  if (dbUser?.banned) {
    await prisma.session.deleteMany({ where: { userId: session.user.id } });
    redirect("/sign-in?toast=banned");
  }

  if (session.user.role !== "admin") redirect("/");

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    >
      {children}
    </AdminShell>
  );
}

