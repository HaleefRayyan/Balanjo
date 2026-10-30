// Stok produk & variasi. Product.stock selalu = total; kalau produk punya variasi, total = jumlah stok variasinya.
// Semua perubahan bersyarat di query (stock >= jumlah), jadi dua pembeli tidak bisa mengambil stok terakhir bersamaan.
import { HttpError } from "./http.js"

// lines: [{ productId, variant, quantity, name }] dari checkout. Dipanggil di dalam prisma.$transaction.
export const reserveStock = async (tx, lines) => {
    const perVariant = new Map() // "productId:variant" -> { productId, variant, quantity, name }
    const perProduct = new Map() // productId -> { quantity, name }
    for (const line of lines) {
        if (line.variant) {
            const key = `${line.productId}:${line.variant}`
            const entry = perVariant.get(key) ?? { ...line, quantity: 0 }
            entry.quantity += line.quantity
            perVariant.set(key, entry)
        }
        const total = perProduct.get(line.productId) ?? { quantity: 0, name: line.name }
        total.quantity += line.quantity
        perProduct.set(line.productId, total)
    }

    for (const { productId, variant, quantity, name } of perVariant.values()) {
        const { count } = await tx.productVariant.updateMany({
            where: { productId, name: variant, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
        })
        if (count === 0) {
            const left = (await tx.productVariant.findUnique({ where: { productId_name: { productId, name: variant } } }))?.stock ?? 0
            throw new HttpError(400, left > 0 ? `Stok ${name} (${variant}) tinggal ${left}.` : `Stok ${name} (${variant}) habis.`)
        }
    }
    for (const [productId, { quantity, name }] of perProduct) {
        const { count } = await tx.product.updateMany({
            where: { id: productId, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
        })
        if (count === 0) {
            const left = (await tx.product.findUnique({ where: { id: productId } }))?.stock ?? 0
            throw new HttpError(400, left > 0 ? `Stok ${name} tinggal ${left}.` : `Stok ${name} habis.`)
        }
    }
}

// Kembalikan stok item yang dibatalkan. Produk yang sudah dihapus dilewati.
// Variasi yang sudah dihapus seller: stoknya tidak dikembalikan (total harus tetap = jumlah variasi),
// kecuali produknya sekarang tanpa variasi sama sekali.
export const releaseStock = async (tx, items) => {
    for (const item of items) {
        if (!item.productId) continue
        let restoreTotal = true
        if (item.variant) {
            const { count } = await tx.productVariant.updateMany({
                where: { productId: item.productId, name: item.variant },
                data: { stock: { increment: item.quantity } },
            })
            if (count === 0) restoreTotal = (await tx.productVariant.count({ where: { productId: item.productId } })) === 0
        }
        if (restoreTotal) {
            await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
        }
    }
}
