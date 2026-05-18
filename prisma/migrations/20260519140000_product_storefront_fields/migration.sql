-- Storefront catalog fields on product
ALTER TABLE "product" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'embroidery';
ALTER TABLE "product" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "product" ADD COLUMN "brand" TEXT;
ALTER TABLE "product" ADD COLUMN "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "product" ADD COLUMN "colors" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "product" ADD COLUMN "fabricType" TEXT;
ALTER TABLE "product" ADD COLUMN "embroideryType" TEXT;
ALTER TABLE "product" ADD COLUMN "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "product" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "product" ADD COLUMN "showInHero" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN "isTopRated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN "isCombo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN "trending" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN "handmade" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN "boutiquePick" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN "newArrival" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "product_isActive_idx" ON "product"("isActive");
CREATE INDEX "product_category_idx" ON "product"("category");
CREATE INDEX "product_featured_idx" ON "product"("featured");
CREATE INDEX "product_trending_idx" ON "product"("trending");
