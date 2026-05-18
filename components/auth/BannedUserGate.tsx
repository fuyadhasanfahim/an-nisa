"use client";

/**
 * Previously this component immediately signed banned users out, which prevented them from browsing.
 * Boutique policy: banned shoppers can still browse, wishlist, and view content — checkout is blocked downstream.
 */
export function BannedUserGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
