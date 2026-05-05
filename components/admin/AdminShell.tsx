"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { AuthToasts } from "@/components/shared/AuthToasts";
import {
  IconChartBar,
  IconCommand,
  IconLogout,
  IconFileInvoice,
  IconLayoutDashboard,
  IconPackage,
  IconReceipt2,
  IconUsers,
} from "@tabler/icons-react";

const items = [
  { href: "/admin", label: "Overview", Icon: IconLayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: IconPackage },
  { href: "/admin/orders", label: "Orders", Icon: IconReceipt2 },
  { href: "/admin/invoices", label: "Invoices", Icon: IconFileInvoice },
  { href: "/admin/earnings", label: "Earnings", Icon: IconChartBar },
  { href: "/admin/customers", label: "Customers", Icon: IconUsers },
];

type AdminShellProps = {
  children: React.ReactNode;
  user: { name: string; email: string; image: string | null };
};

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentItem =
    items.find((i) => i.href === pathname) ??
    items.find((i) => (pathname ? pathname.startsWith(i.href + "/") : false)) ??
    items[0];
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <AuthToasts />
      <aside className="fixed inset-y-0 left-0 w-[240px] bg-white">
        <div className="absolute inset-y-0 right-0 w-px bg-black/10" />

        <div className="px-5 py-6">
          <div className="font-serif text-xl tracking-tight text-brand-black">
            Admin
          </div>
          <div className="mt-1 text-xs text-black/55">An Nisa’s World</div>
        </div>

        <nav className="px-3">
          <div className="grid gap-1">
            {items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
                    active
                      ? "bg-[#fcc4c8] text-brand-black"
                      : "text-black/70 hover:bg-black/5 hover:text-brand-black",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-5 w-5 transition",
                      active ? "text-brand-black" : "text-black/55",
                    ].join(" ")}
                    stroke={1.8}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      <div className="pl-[240px]">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f9fafb]/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <div>
              <div className="text-[11px] font-medium tracking-wide text-black/45">
                Admin <span className="mx-1 text-black/25">/</span>{" "}
                {currentItem.label}
              </div>
              <div className="mt-1 font-serif text-2xl tracking-tight text-brand-black">
                {currentItem.label}
              </div>
            </div>

            <div ref={rootRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                onClick={() => setOpen((v) => !v)}
                className={[
                  "flex items-center gap-3 rounded-xl bg-white px-2 py-2 shadow-sm ring-1 ring-black/5 transition",
                  "hover:shadow-softSm",
                  "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
                ].join(" ")}
              >
                <div className="h-9 w-9 overflow-hidden rounded-full bg-black/5">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <IconCommand className="h-5 w-5 text-black/55" stroke={1.8} />
                    </div>
                  )}
                </div>

                <div className="hidden text-left sm:block">
                  <div className="text-xs font-medium text-black/75">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-black/45">{user.email}</div>
                </div>
              </button>

              {open ? (
                <div
                  id={menuId}
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5"
                >
                  <div className="px-4 py-4">
                    <div className="text-xs font-medium text-black/50">
                      Signed in as
                    </div>
                    <div className="mt-1 text-sm font-medium text-brand-black">
                      {user.name}
                    </div>
                    <div className="mt-0.5 text-xs text-black/55">
                      {user.email}
                    </div>
                  </div>

                  <div className="h-px bg-black/5" />

                  <div className="p-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        const callbackUrl = pathname || "/admin";
                        try {
                          setOpen(false);
                          await authClient.signOut();
                        } finally {
                          const params = new URLSearchParams();
                          params.set("toast", "signed-out");
                          params.set("callbackUrl", callbackUrl);
                          router.push(`/sign-in?${params.toString()}`);
                          router.refresh();
                        }
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-brand-black"
                    >
                      <IconLogout className="h-4 w-4" stroke={1.8} />
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="rounded-2xl bg-transparent">{children}</div>
        </main>
      </div>
    </div>
  );
}

