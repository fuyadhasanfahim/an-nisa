-- AlterTable
ALTER TABLE "product" ADD COLUMN "stockQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "product" ADD COLUMN "trackInventory" BOOLEAN NOT NULL DEFAULT false;
