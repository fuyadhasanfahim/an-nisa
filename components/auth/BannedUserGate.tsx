"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";

export function BannedUserGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || !session?.user) return;
    const u = session.user as { banned?: boolean };
    if (u.banned) {
      void authClient.signOut().then(() => {
        window.location.assign("/sign-in?toast=banned");
      });
    }
  }, [session, isPending]);

  return <>{children}</>;
}
