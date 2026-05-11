-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cod', 'bkash', 'nagad', 'card', 'bank_transfer', 'other');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed');

-- AlterTable
ALTER TABLE "order" ADD COLUMN "subtotalCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "order" ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "order" ADD COLUMN "shippingFeeCents" INTEGER NOT NULL DEFAULT 0;

-- Backfill subtotal for existing orders
UPDATE "order" SET "subtotalCents" = "totalCents" WHERE "subtotalCents" = 0;

-- AlterTable
ALTER TABLE "order" ALTER COLUMN "subtotalCents" DROP DEFAULT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'cod';

-- AlterTable
ALTER TABLE "order" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "order" ADD COLUMN "shippingPhone" TEXT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN "shippingAddress" TEXT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN "shippingCity" TEXT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN "shippingCountry" TEXT NOT NULL DEFAULT 'BD';
