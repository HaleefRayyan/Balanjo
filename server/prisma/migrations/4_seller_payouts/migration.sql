-- AlterTable
ALTER TABLE "User" ADD COLUMN     "payoutAccountName" TEXT,
ADD COLUMN     "payoutAccountNumber" TEXT,
ADD COLUMN     "payoutMethod" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "platformFee" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Payout" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "adminNote" TEXT,
    "processedById" INTEGER,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payout_sellerId_idx" ON "Payout"("sellerId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Satu pengajuan payout PENDING per seller (dibuat manual: Prisma belum mendukung partial index).
-- Mencegah dua pengajuan bersamaan menarik saldo yang sama.
CREATE UNIQUE INDEX "Payout_one_pending_per_seller" ON "Payout"("sellerId") WHERE "status" = 'PENDING';
