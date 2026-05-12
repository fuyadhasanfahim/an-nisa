-- CreateEnum
CREATE TYPE "PaymentCollectedVia" AS ENUM ('cash', 'bkash', 'nagad', 'card', 'bank_transfer', 'other');

-- AlterTable
ALTER TABLE "order" ADD COLUMN "paymentId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "order" ADD COLUMN "paymentCollectedVia" "PaymentCollectedVia" NOT NULL DEFAULT 'cash';
