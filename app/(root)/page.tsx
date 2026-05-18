import type { Metadata } from "next";
import { Suspense } from "react";
import { BoutiqueShopExperience } from "@/components/shop/BoutiqueShopExperience";

export const metadata: Metadata = {
  title: "An‑Nisa heirloom boutique — embroidered fashion",
  description:
    "Premium women’s embroidery, handmade needlework and bespoke fashion pieces curated inside a luminous storefront.",
};

function BoutiqueLandingFallback() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-28">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="h-32 animate-pulse rounded-[40px] bg-black/[0.08] dark:bg-white/12" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="h-80 animate-pulse rounded-[32px] bg-black/[0.08] dark:bg-white/15" />
          <div className="h-80 animate-pulse rounded-[32px] bg-black/[0.06] dark:bg-white/13" />
        </div>
      </div>
    </div>
  );
}

export default function BoutiqueLandingPage() {
  return (
    <Suspense fallback={<BoutiqueLandingFallback />}>
      <BoutiqueShopExperience />
    </Suspense>
  );
}
