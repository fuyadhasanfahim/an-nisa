"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AuthToasts } from "@/components/shared/AuthToasts";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import {
  IconChartBar,
  IconCoinOff,
  IconHome,
  IconLayoutDashboard,
  IconPackage,
  IconReceipt2,
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

const items = [
  { href: "/admin", label: "Overview", Icon: IconLayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: IconPackage },
  { href: "/admin/orders", label: "Orders", Icon: IconReceipt2 },
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
  const [collapsed, setCollapsed] = useState(false);

  // Compute active page title dynamically
  const activeItem = items.find((item) => {
    if (item.href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === item.href || pathname?.startsWith(item.href + "/");
  });
  const pageTitle = activeItem ? activeItem.label : "Admin";

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <AuthToasts />
      <aside className={[
        "fixed inset-y-0 left-0 bg-white transition-all duration-300 z-30 flex flex-col",
        collapsed ? "w-[70px]" : "w-[240px]"
      ].join(" ")}>
        <div className="absolute inset-y-0 right-0 w-px bg-black/10" />

        <div className={[
          "py-6 transition-all duration-300 flex items-center justify-center",
          collapsed ? "px-3" : "px-5"
        ].join(" ")}>
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fcc4c8]/25 border border-[#fcc4c8]/30 font-serif text-sm font-bold text-brand-black select-none animate-fade-in shadow-sm">
              AN
            </div>
          ) : (
            <Image
              src="https://res.cloudinary.com/dqc36sq78/image/upload/q_auto/f_auto/v1779542579/an-nisa-logo_rrjm1q.png"
              alt="An Nisa's World Logo"
              width={150}
              height={46}
              className="h-10 w-auto object-contain animate-fade-in"
              priority
            />
          )}
        </div>

        <nav className={[
          "transition-all duration-300",
          collapsed ? "px-2" : "px-3"
        ].join(" ")}>
          <div className="grid gap-1.5">
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
                    "group flex items-center rounded-xl transition-all duration-300",
                    collapsed ? "justify-center p-3" : "gap-3 px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-brand-pink/40",
                    active
                      ? "bg-[#fcc4c8] text-brand-black shadow-sm font-semibold"
                      : "text-black/70 hover:bg-black/5 hover:text-brand-black",
                  ].join(" ")}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={[
                      "h-5 w-5 transition-transform duration-300 group-hover:scale-105 shrink-0",
                      active ? "text-brand-black" : "text-black/55",
                    ].join(" ")}
                    stroke={1.8}
                  />
                  {!collapsed && <span className="font-medium truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      <div className={[
        "transition-all duration-300",
        collapsed ? "pl-[70px]" : "pl-[240px]"
      ].join(" ")}>
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f9fafb]/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-black/55 hover:text-brand-black transition duration-200 cursor-pointer flex items-center justify-center border border-black/5 bg-white shadow-sm"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label="Toggle sidebar collapse"
              >
                {collapsed ? (
                  <IconChevronRight className="h-4 w-4" stroke={2} />
                ) : (
                  <IconChevronLeft className="h-4 w-4" stroke={2} />
                )}
              </button>
              <span className="text-sm font-bold tracking-tight text-brand-black">{pageTitle}</span>
            </div>

            <ProfileMenu
              user={user}
              signOutMode="redirect-sign-in"
              menuExtras={
                <Link
                  href="/"
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/35 hover:text-brand-black"
                >
                  <IconHome className="h-4 w-4 text-brand-black/75" stroke={1.8} />
                  Home Page
                </Link>
              }
            />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 py-6">
          <div className="rounded-2xl bg-transparent">{children}</div>
        </main>
      </div>
    </div>
  );
}

