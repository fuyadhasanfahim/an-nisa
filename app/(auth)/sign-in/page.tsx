"use client";

import { Suspense } from "react";
import { SignInPage } from "@/components/auth/SignInPage";
import { Container } from "@/components/shared/Container";

function SignInFallback() {
  return (
    <main className="flex-1 bg-white">
      <Container>
        <div className="py-16 text-center text-sm text-black/55">Loading…</div>
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

