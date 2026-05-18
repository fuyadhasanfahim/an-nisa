"use client";

import Link from "next/link";
import Image from "next/image";
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
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/20 hover:text-brand-black"
        >
          My Orders
        </Link>
        <Link
          href="/wishlist"
          role="menuitem"
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/20 hover:text-brand-black"
        >
          Wishlist
        </Link>
      </>
    );
  }, []);

  return (
    <header className="glass-strong sticky top-0 z-[90] border-b border-brand-pink/15">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="https://res.cloudinary.com/dchvqlhdw/image/upload/v1779132346/an-nisa_vutown.png"
            alt="An-Nisa Logo"
            width={130}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Search bar (desktop) */}
        <div className="hidden flex-1 md:block">
          <Suspense
            fallback={
              <div className="h-10 rounded-xl bg-brand-pink/10" />
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
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-pink/30 bg-white/75 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-brand-pink/15 hover:border-brand-pink/60"
          >
            <IconHeart
              className="h-[20px] w-[20px] text-brand-black/75"
              stroke={1.8}
            />
            {wishlistQty > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#fcc4c8] px-1 text-[10px] font-bold text-brand-black ring-2 ring-white shadow-sm">
                {wishlistQty}
              </span>
            )}
          </Link>

          {/* Cart */}
          <BoutiqueMiniCart />

          {/* Auth */}
          {!user ? (
            <Link href="/sign-in">
              <Button className="rounded-xl px-4 py-2 text-xs">Login</Button>
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
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/20 hover:text-brand-black"
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
      <div className="border-t border-brand-pink/10 px-4 pb-3 pt-2 md:hidden">
        <Suspense
          fallback={
            <div className="h-10 rounded-xl bg-brand-pink/10" />
          }
        >
          <BoutiqueSearchBar placement="inline" />
        </Suspense>
      </div>
    </header>
  );
}
