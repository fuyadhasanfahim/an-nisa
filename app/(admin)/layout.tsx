import { auth } from "@/lib/auth/auth";
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

