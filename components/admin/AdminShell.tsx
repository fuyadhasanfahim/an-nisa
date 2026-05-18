"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthToasts } from "@/components/shared/AuthToasts";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import {
  IconChartBar,
  IconCoinOff,
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
  { href: "/admin/expenses", label: "Expenses", Icon: IconCoinOff },
  { href: "/admin/customers", label: "Customers", Icon: IconUsers },
];

type AdminShellProps = {
  children: React.ReactNode;
  user: { name: string; email: string; image: string | null };
};

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();

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
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
            <div className="text-sm text-black/45">Admin</div>

            <ProfileMenu user={user} signOutMode="redirect-sign-in" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 py-6">
          <div className="rounded-2xl bg-transparent">{children}</div>
        </main>
      </div>
    </div>
  );
}

