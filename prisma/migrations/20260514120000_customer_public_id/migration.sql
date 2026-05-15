-- AlterTable
ALTER TABLE "customer_profile" ADD COLUMN "publicCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customer_profile_publicCustomerId_key" ON "customer_profile"("publicCustomerId");
