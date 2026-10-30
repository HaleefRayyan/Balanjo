-- Variasi dengan stok masing-masing + beberapa foto per produk.
-- Data lama dipindah: variasi dari kolom JSON "variants" (stok lama dibagi rata, sisanya ke variasi pertama
-- sehingga total tetap sama), dan foto sampul lama menjadi foto pertama.

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPhoto" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_name_key" ON "ProductVariant"("productId", "name");

-- CreateIndex
CREATE INDEX "ProductPhoto_productId_idx" ON "ProductPhoto"("productId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPhoto" ADD CONSTRAINT "ProductPhoto_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Pindahkan variasi lama (nama ganda digabung)
WITH named AS (
    SELECT p."id" AS product_id, e.name, MIN(e.ord) AS ord
    FROM "Product" p, jsonb_array_elements_text(p."variants"::jsonb) WITH ORDINALITY AS e(name, ord)
    WHERE btrim(e.name) <> ''
    GROUP BY p."id", e.name
), numbered AS (
    SELECT product_id, name,
        ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY ord) AS k,
        COUNT(*) OVER (PARTITION BY product_id) AS n
    FROM named
)
INSERT INTO "ProductVariant" ("productId", "name", "stock", "position")
SELECT nb.product_id, nb.name,
    p."stock" / nb.n + CASE WHEN nb.k <= p."stock" % nb.n THEN 1 ELSE 0 END,
    nb.k - 1
FROM numbered nb JOIN "Product" p ON p."id" = nb.product_id;

-- Foto sampul lama = foto pertama
INSERT INTO "ProductPhoto" ("productId", "url", "position")
SELECT "id", "photoUrl", 0 FROM "Product";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "variants";
