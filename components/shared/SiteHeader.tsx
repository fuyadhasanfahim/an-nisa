"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/Button";

export function SiteHeader() {
  const { data: session } = authClient.useSession();

  return (
    <header className="border-b border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              className="h-9 w-9 rounded-xl stitch-border stitch-glow shadow-softSm"
              animate={{ backgroundPositionX: ["0%", "200%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <div className="leading-tight">
              <div className="font-serif text-lg tracking-tight">An-Nisa</div>
              <div className="text-xs text-black/60">Premium Embroidery</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/shop" className="text-black/70 hover:text-black">
              Shop
            </Link>
            <Link
              href="/custom-order"
              className="text-black/70 hover:text-black"
            >
              Custom order
            </Link>
            <Link href="/admin" className="text-black/70 hover:text-black">
              Admin
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {!session ? (
              <Link href="/sign-in">
                <Button variant="ghost">Sign in</Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                onClick={() => authClient.signOut()}
                aria-label="Sign out"
              >
                Sign out
              </Button>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}

