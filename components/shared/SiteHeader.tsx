'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { IconHeart, IconLayoutDashboard, IconShoppingBag } from '@tabler/icons-react';
import { ProfileMenu } from '@/components/shared/ProfileMenu';
import { authClient } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/Button';
import { BoutiqueSearchBar } from '@/components/shop/BoutiqueSearchBar';
import { BoutiqueMiniCart } from '@/components/shop/BoutiqueMiniCart';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils/cn';

export function SiteHeader() {
    const { data: session } = authClient.useSession();
    const user = session?.user;
    const isAdmin = user?.role === 'admin';
    const wishlistQty = useAppSelector(
        (state) => state.boutiqueUi.wishlist.length,
    );

    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

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
            <div className="mx-auto flex items-center gap-2 sm:gap-4 p-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex shrink-0 items-center">
                    <Image
                        src="https://res.cloudinary.com/dchvqlhdw/image/upload/v1779167222/an_nisa_s_world_mbnwbu.png"
                        alt="An-Nisa Logo"
                        width={130}
                        height={40}
                        priority
                    />
                </Link>

                {/* Search bar */}
                <div className="flex-1 max-w-[460px] mx-2 sm:mx-4 md:mx-auto min-w-[120px]">
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
                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        aria-label={`Wishlist (${wishlistQty})`}
                        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#fcc4c8]/50 bg-white/75 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8]"
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
                            <Button className="rounded-xl px-4 py-2 text-xs">
                                Login
                            </Button>
                        </Link>
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
                </div>
            </div>

        </header>
    );
}
