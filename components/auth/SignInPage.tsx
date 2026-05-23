"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { Container } from "@/components/shared/Container";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useSearchParams } from "next/navigation";
import { AuthToasts } from "@/components/shared/AuthToasts";

export function SignInPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  async function onGoogle() {
    const raw = searchParams.get("callbackUrl") ?? "/admin";
    const callbackUrl = raw.startsWith("/sign-in") ? "/admin" : raw;
    const callbackWithToast =
      callbackUrl +
      (callbackUrl.includes("?") ? "&" : "?") +
      "toast=signed-in";

    try {
      setLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackWithToast,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-[#fffbfa] via-white to-[#fff5f6] flex items-center justify-center py-12 md:py-24">
      <AuthToasts />
      <Container>
        <div>
          <AuthCard
            showBrandLogo={true}
            title="Sign in"
            subtitle="Continue with Google to access your account."
          >
            <div className="space-y-6">
              <GoogleButton loading={loading} onClick={onGoogle} />

              <p className="text-center text-xs leading-relaxed text-black/55">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-black/70 underline hover:text-[#fcc4c8] transition duration-200">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-black/70 underline hover:text-[#fcc4c8] transition duration-200">
                  Privacy
                </Link>.
              </p>
            </div>
          </AuthCard>
        </div>
      </Container>
    </main>
  );
}

