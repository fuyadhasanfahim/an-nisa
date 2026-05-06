-- AlterTable
ALTER TABLE "product" ADD COLUMN "sku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");
