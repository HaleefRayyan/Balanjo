-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentExpiresAt" TIMESTAMP(3),
ADD COLUMN     "paymentRef" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PAID',
ADD COLUMN     "paymentToken" TEXT,
ADD COLUMN     "paymentType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentRef_key" ON "Order"("paymentRef");

