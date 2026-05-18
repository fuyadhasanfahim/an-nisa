"use client";

import { BoutiqueHero } from "@/components/shop/BoutiqueHero";
import { BoutiqueProductRail } from "@/components/shop/BoutiqueProductRail";
import { BoutiqueReviewsCarousel } from "@/components/shop/BoutiqueReviewsCarousel";
import { BoutiqueShopCatalog } from "@/components/shop/BoutiqueShopCatalog";

export function BoutiqueShopExperience() {
  return (
    <main className="flex-1">
      <BoutiqueHero />
      <BoutiqueProductRail
        title="Featured atelier vignettes"
        description="Pieces our stylists obsess over—the quiet glamour edit."
        query="featured=true&limit=14&sortMode=latest"
      />
      <BoutiqueProductRail
        title="Top rated heirloom scores"
        description="Loved loudest across fittings, salons, gifting suites."
        query="topRated=true&limit=12&sortMode=top_rated"
      />
      <BoutiqueProductRail
        title="Curated combo offerings"
        description="Layer-ready pairings stitched to live together gracefully."
        query="combo=true&limit=11&sortMode=popular"
      />
      <BoutiqueProductRail
        title="Trending muse boards"
        description="What boutiques are pinning this week—the pulse lane."
        query="trending=true&limit=12&sortMode=popular"
      />
      <BoutiqueReviewsCarousel />
      <BoutiqueProductRail
        title="Handmade capsule"
        description="Human-paced tension checks, floss kissed sunlight."
        query="handmadeCollection=true&limit=13&sortMode=latest"
      />
      <BoutiqueProductRail
        title="Embroidery tapestry house"
        description="Thread-first storytelling on couture-weight bases."
        query="embroideryCollection=true&limit=13&sortMode=latest"
      />
      <BoutiqueProductRail
        title="New arrivals altar"
        description="Fresh motifs just cleared QC—blink and they heirloom away."
        query="newArrival=true&limit=12&sortMode=latest"
      />
      <BoutiqueProductRail
        title="Premium boutique picks"
        description="The director’s ribbons—museum-meets-modern femininity."
        query="boutique=true&limit=12&sortMode=top_rated"
      />

      <BoutiqueShopCatalog />
    </main>
  );
}
