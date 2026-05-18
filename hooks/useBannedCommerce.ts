"use client";

import { authClient } from "@/lib/auth/auth-client";

export function useBannedCommerce() {
  const { data: session, isPending } = authClient.useSession();
  const banned = Boolean((session?.user as { banned?: boolean } | undefined)?.banned);
  const message =
    "Purchasing is paused for this account. You can browse and save favorites—please contact concierge for help.";

  return {
    signedIn: Boolean(session?.user),
    isSessionPending: isPending,
    banned,
    commerceBlocked: banned,
    message,
  };
}
