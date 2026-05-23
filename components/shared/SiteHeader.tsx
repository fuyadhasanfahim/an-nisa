'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { IconHeart, IconLayoutDashboard, IconShoppingBag, IconSearch, IconUser, IconMenu2 } from '@tabler/icons-react';
import { ProfileMenu } from '@/components/shared/ProfileMenu';
import { authClient } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/Button';
import { BoutiqueSearchBar } from '@/components/shop/BoutiqueSearchBar';
import { BoutiqueMiniCart } from '@/components/shop/BoutiqueMiniCart';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { cn } from '@/lib/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';
import { setMobileFiltersOpen } from '@/store/slices/boutiqueUISlice';

export function SiteHeader() {
    const { data: session } = authClient.useSession();
    const user = session?.user;
    const isAdmin = user?.role === 'admin';
    const wishlistQty = useAppSelector(
        (state) => state.boutiqueUi.wishlist.length,
    );
    const dispatch = useAppDispatch();

    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    useEffect(() => {
        setMobileSearchOpen(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY <= 15) {
                setVisible(true);
            } else if (currentScrollY > lastScrollY) {
                setVisible(false);
            } else {
                setVisible(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const menuExtras = useMemo(() => {
        return (
            <>
                <Link
                    href="/account/orders"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/35 hover:text-brand-black"
                >
                    <IconShoppingBag className="h-4 w-4 text-brand-black/75" stroke={1.8} />
                    My Orders
                </Link>
                <Link
                    href="/wishlist"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/35 hover:text-brand-black"
                >
                    <IconHeart className="h-4 w-4 text-brand-black/75" stroke={1.8} />
                    Wishlist
                </Link>
            </>
        );
    }, []);

    return (
        <header className={cn(
            "glass-strong sticky top-0 z-[90] border-b border-brand-pink/15 transition-transform duration-300 ease-in-out",
            visible ? "translate-y-0" : "-translate-y-full"
        )}>
            <div className="mx-auto flex items-center gap-1.5 sm:gap-4 p-3.5 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex shrink-0 items-center select-none transition duration-300 active:scale-[0.98]">
                    <Image
                        src="https://res.cloudinary.com/dqc36sq78/image/upload/q_auto/f_auto/v1779542579/an-nisa-logo_rrjm1q.png"
                        alt="An Nisa's World Logo"
                        width={180}
                        height={55}
                        className="h-10 w-auto object-contain sm:h-14 md:h-16"
                        priority
                    />
                </Link>

                {/* Search bar */}
                <div className="hidden md:block flex-1 max-w-[460px] mx-4 md:mx-auto">
                    <Suspense
                        fallback={
                            <div className="h-11 rounded-full bg-[#fcc4c8]/10" />
                        }
                    >
                        <BoutiqueSearchBar />
                    </Suspense>
                </div>

                {/* Right actions */}
                <div className="ml-auto flex items-center gap-2">
                    {/* Mobile Search Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#fcc4c8]/50 bg-white/75 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8] md:hidden cursor-pointer"
                        aria-label="Toggle search"
                    >
                        <IconSearch
                            className={cn(
                                "h-[20px] w-[20px] text-brand-black/75 transition-transform duration-300",
                                mobileSearchOpen ? "rotate-90 text-[#fcc4c8]" : ""
                            )}
                            stroke={1.8}
                        />
                    </button>

                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        aria-label={`Wishlist (${wishlistQty})`}
                        className="relative hidden md:inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#fcc4c8]/50 bg-white/75 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8]"
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
                        <>
                            {/* Desktop Sign in */}
                            <Link
                                href="/sign-in"
                                className="hidden md:inline-flex h-11 items-center justify-center rounded-full bg-[#fcc4c8] px-5 text-xs font-bold text-brand-black shadow-sm transition-all duration-300 hover:scale-105 hover:bg-[#fcc4c8]/85 active:scale-95 border border-[#fcc4c8]/20 cursor-pointer min-w-[76px]"
                            >
                                Sign in
                            </Link>
                            {/* Mobile Sign in */}
                            <Link
                                href="/sign-in"
                                aria-label="Sign in"
                                className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-full border border-[#fcc4c8]/50 bg-[#fcc4c8] text-brand-black shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                            >
                                <IconUser className="h-[20px] w-[20px]" stroke={1.8} />
                            </Link>
                        </>
                    ) : (
                        <ProfileMenu
                            user={{
                                name:
                                    user.name?.trim() ||
                                    user.email ||
                                    'Account',
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
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-brand-pink/35 hover:text-brand-black"
                                        >
                                            <IconLayoutDashboard
                                                className="h-4 w-4"
                                                stroke={1.8}
                                            />
                                            Admin Panel
                                        </Link>
                                    )}
                                </>
                            }
                        />
                    )}

                    {/* Hamburger Menu Button */}
                    <button
                        type="button"
                        onClick={() => dispatch(setMobileFiltersOpen(true))}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#fcc4c8]/50 bg-white/75 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8] md:hidden cursor-pointer shrink-0"
                        aria-label="Open menu"
                    >
                        <IconMenu2 className="h-[20px] w-[20px] text-brand-black/75" stroke={1.8} />
                    </button>
                </div>
            </div>

            {/* Mobile search dropdown */}
            <AnimatePresence>
                {mobileSearchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#fcc4c8]/15 bg-white/95 px-4 py-3 md:hidden"
                    >
                        <Suspense
                            fallback={
                                <div className="h-11 rounded-full bg-[#fcc4c8]/10" />
                            }
                        >
                            <BoutiqueSearchBar placement="inline" />
                        </Suspense>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
