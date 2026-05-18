"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconLayoutDashboard } from "@tabler/icons-react";
import { Container } from "@/components/shared/Container";
import { ProfileMenu } from "@/components/shared/ProfileMenu";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/Button";

export function SiteHeader() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 shrink items-center gap-3">
            <motion.div
              className="h-9 w-9 shrink-0 rounded-xl stitch-border stitch-glow shadow-softSm"
              animate={{ backgroundPositionX: ["0%", "200%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <div className="leading-tight">
              <div className="font-serif text-lg tracking-tight">An-Nisa</div>
              <div className="hidden text-xs text-black/60 sm:block">
                Premium Embroidery
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <Link href="/shop" className="text-black/70 hover:text-black">
              Shop
            </Link>
            <Link
              href="/custom-order"
              className="text-black/70 hover:text-black"
            >
              Custom order
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {!user ? (
              <Link href="/sign-in">
                <Button variant="ghost">Sign in</Button>
              </Link>
            ) : (
              <ProfileMenu
                user={{
                  name: user.name?.trim() || user.email || "Account",
                  email: user.email,
                  image: user.image ?? null,
                }}
                menuExtras={
                  isAdmin ? (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-brand-black"
                    >
                      <IconLayoutDashboard className="h-4 w-4" stroke={1.8} />
                      Admin dashboard
                    </Link>
                  ) : null
                }
              />
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}

