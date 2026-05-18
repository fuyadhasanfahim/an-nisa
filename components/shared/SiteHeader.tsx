"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import {
  IconHeart,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/Button";
import { BoutiqueSearchBar } from "@/components/shop/BoutiqueSearchBar";
import { BoutiqueMiniCart } from "@/components/shop/BoutiqueMiniCart";
import { useAppSelector } from "@/store/hooks";

export function SiteHeader() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const wishlistQty = useAppSelector((state) => state.boutiqueUi.wishlist.length);

  const menuExtras = useMemo(() => {
    return (
      <>
        <Link
          href="/account/orders"
          role="menuitem"
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/15 hover:text-brand-black dark:text-white/70 dark:hover:bg-white/8"
        >
          My Orders
        </Link>
        <Link
          href="/wishlist"
          role="menuitem"
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/15 hover:text-brand-black dark:text-white/70 dark:hover:bg-white/8"
        >
          Wishlist
        </Link>
      </>
    );
  }, []);

  return (
    <header className="sticky top-0 z-[90] border-b border-black/8 bg-white/95 backdrop-blur-xl dark:border-white/8 dark:bg-[#0b090c]/95">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pink/60 text-sm font-bold text-brand-black">
            AN
          </div>
          <span className="font-serif text-lg tracking-tight text-brand-black dark:text-white">
            An‑Nisa
          </span>
        </Link>

        {/* Search bar (desktop) */}
        <div className="hidden flex-1 md:block">
          <Suspense
            fallback={
              <div className="h-10 rounded-lg bg-black/4 dark:bg-white/6" />
            }
          >
            <BoutiqueSearchBar />
          </Suspense>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist (${wishlistQty})`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/8 bg-white transition hover:bg-brand-pink/15 dark:border-white/12 dark:bg-white/6 dark:hover:bg-white/10"
          >
            <IconHeart
              className="h-[18px] w-[18px] text-brand-black dark:text-white"
              stroke={1.8}
            />
            {wishlistQty > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-pink px-1 text-[10px] font-bold text-brand-black">
                {wishlistQty}
              </span>
            )}
          </Link>

          {/* Cart */}
          <BoutiqueMiniCart />

          {/* Auth */}
          {!user ? (
            <Link href="/sign-in">
              <Button className="rounded-lg px-4 py-2 text-xs">Login</Button>
            </Link>
          ) : (
            <ProfileMenu
              user={{
                name: user.name?.trim() || user.email || "Account",
                email: user.email,
                image: user.image ?? null,
              }}
              menuExtras={
                <>
                  {menuExtras}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/15 hover:text-brand-black dark:text-white/70 dark:hover:bg-white/8"
                    >
                      <IconLayoutDashboard className="h-4 w-4" stroke={1.8} />
                      Admin Panel
                    </Link>
                  )}
                </>
              }
            />
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="border-t border-black/5 px-4 pb-3 pt-2 md:hidden dark:border-white/6">
        <Suspense
          fallback={
            <div className="h-10 rounded-lg bg-black/4 dark:bg-white/6" />
          }
        >
          <BoutiqueSearchBar placement="inline" />
        </Suspense>
      </div>
    </header>
  );
}
