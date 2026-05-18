"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import {
  IconHeart,
  IconLayoutDashboard,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { Container } from "@/components/shared/Container";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/Button";
import { BoutiqueSearchBar } from "@/components/shop/BoutiqueSearchBar";
import { BoutiqueMiniCart } from "@/components/shop/BoutiqueMiniCart";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/boutiqueUISlice";

export function SiteHeader() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.boutiqueUi.theme);
  const wishlistQty = useAppSelector((state) => state.boutiqueUi.wishlist.length);

  const menuExtras = useMemo(() => {
    return (
      <>
        <Link
          href="/account/orders"
          role="menuitem"
          className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-black/72 transition hover:bg-black/[0.045] hover:text-brand-black dark:text-white/73 dark:hover:bg-white/[0.05]"
        >
          Orders thread
        </Link>
        <Link
          href="/wishlist"
          role="menuitem"
          className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-black/72 transition hover:bg-black/[0.045] hover:text-brand-black dark:text-white/73 dark:hover:bg-white/[0.05]"
        >
          Moodboard favorites
        </Link>
      </>
    );
  }, []);

  return (
    <header className="sticky top-0 z-[90] border-b border-black/10 bg-[color-mix(in_srgb,var(--background)_94%,transparent)]/90 backdrop-blur-xl dark:border-white/10">
      <Container>
        <div className="flex h-[88px] items-center gap-6">
          <Link href="/" className="flex min-w-[150px] shrink-0 items-center gap-4">
            <motion.div
              className="h-12 w-12 shrink-0 rounded-[20px] border-2 border-dashed border-brand-pink bg-brand-pink/60 shadow-softSm dark:bg-brand-pink/40"
              animate={{ rotate: [0, 1.25, -1.25, 0] }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            />
            <div className="leading-tight">
              <div className="font-serif text-[1.05rem] tracking-tight md:text-xl">An‑Nisa</div>
              <div className="hidden text-[11px] uppercase tracking-[0.3em] text-black/53 dark:text-white/62 sm:block">
                Embroidery muse
              </div>
            </div>
          </Link>

          <Suspense fallback={<div className="hidden h-12 flex-1 rounded-full bg-black/5 md:block" />}>
            <BoutiqueSearchBar />
          </Suspense>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle light and dark mode"
              onClick={() => dispatch(toggleTheme())}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white/90 shadow-softSm transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/15"
            >
              {theme === "dark" ? (
                <IconSun className="h-[22px] w-[22px] text-yellow-600" stroke={1.5} />
              ) : (
                <IconMoon className="h-[22px] w-[22px] text-brand-black" stroke={1.35} />
              )}
            </button>

            <Link
              href="/wishlist"
              aria-label={`Wishlisted pieces (${wishlistQty})`}
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white/90 shadow-softSm transition hover:bg-white dark:border-white/18 dark:bg-white/10 dark:hover:bg-white/[0.17]"
            >
              <IconHeart className="h-6 w-6 text-brand-black dark:text-white" stroke={1.6} />
              {wishlistQty ? (
                <span className="absolute -top-1 -right-1 min-h-[23px] min-w-[23px] rounded-full bg-brand-pink px-[6px] text-center text-[11px] font-semibold leading-[23px] text-brand-black">
                  {wishlistQty}
                </span>
              ) : null}
            </Link>

            <BoutiqueMiniCart />

            {!user ? (
              <Link href="/sign-in">
                <Button className="rounded-full px-6">Login</Button>
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
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-black/70 transition hover:bg-black/[0.05] hover:text-brand-black dark:text-white/70 dark:hover:bg-white/[0.08]"
                      >
                        <IconLayoutDashboard className="h-4 w-4" stroke={1.8} />
                        Admin studio
                      </Link>
                    ) : null}
                  </>
                }
              />
            )}
          </div>
        </div>
        <div className="pb-4 md:hidden">
          <Suspense fallback={<div className="h-12 rounded-full bg-black/5" />}>
            <BoutiqueSearchBar placement="inline" />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
