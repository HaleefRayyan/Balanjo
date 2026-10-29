-- Foto profil user + stok produk.
-- Produk yang sudah ada diberi stok awal 20 supaya tetap bisa dibeli.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "variants" TEXT NOT NULL DEFAULT '[]',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sellerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("category", "createdAt", "description", "id", "name", "photoUrl", "price", "sellerId", "variants") SELECT "category", "createdAt", "description", "id", "name", "photoUrl", "price", "sellerId", "variants" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_category_idx" ON "Product"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;


UPDATE "Product" SET "stock" = 20;
