"use client";

import { Suspense } from "react";
import { SignInPage } from "@/components/auth/SignInPage";
import { Container } from "@/components/shared/Container";

function SignInFallback() {
  return (
    <main className="flex-1 bg-gradient-to-br from-[#fffbfa] via-white to-[#fff5f6] flex items-center justify-center py-12 md:py-24">
      <Container>
        <div className="text-center text-sm text-black/45 font-semibold">Loading…</div>
      </Container>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInPage />
    </Suspense>
  );
}
