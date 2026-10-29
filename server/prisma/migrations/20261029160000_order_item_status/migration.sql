-- Status pindah dari Order ke OrderItem (satu pesanan bisa berisi produk beberapa seller),
-- dan OrderItem menyimpan sellerId saat dibeli.
-- Ditulis manual: OrderItem dibuat ulang lebih dulu supaya status lama dari Order
-- dan seller dari Product bisa disalin sebelum kolom Order.status dibuang.

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "sellerId" INTEGER,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "variant" TEXT,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("id", "orderId", "productId", "sellerId", "name", "price", "variant", "quantity", "status")
SELECT
    oi."id", oi."orderId", oi."productId",
    (SELECT p."sellerId" FROM "Product" p WHERE p."id" = oi."productId"),
    oi."name", oi."price", oi."variant", oi."quantity",
    -- status lama (PENDING | PAID | SHIPPED | DONE | CANCELLED) -> status item yang baru
    CASE o."status" WHEN 'PAID' THEN 'PROCESSING' WHEN 'SHIPPED' THEN 'SHIPPED' WHEN 'DONE' THEN 'DONE' WHEN 'CANCELLED' THEN 'CANCELLED' ELSE 'PENDING' END
FROM "OrderItem" oi
JOIN "Order" o ON o."id" = oi."orderId";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE INDEX "OrderItem_sellerId_idx" ON "OrderItem"("sellerId");

CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("id", "userId", "total", "createdAt") SELECT "id", "userId", "total", "createdAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
