// Keranjang user yang login, tersimpan di server supaya sama di semua perangkat.
// Frontend mengirim seluruh isi keranjang setiap kali berubah (PUT), jadi tidak ada konflik per item.
import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { requireAuth } from "../middleware/auth.js"
import { parse } from "../utils/http.js"

const router = Router()
router.use(requireAuth)

const MAX_LINES = 50

const serializeCart = (rows) => rows.map((row) => ({
    productId: row.productId,
    variant: row.variant || undefined,
    quantity: row.quantity,
}))

router.get("/", async (req, res) => {
    const rows = await prisma.cartItem.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "asc" } })
    res.json({ items: serializeCart(rows) })
})

// Ganti seluruh isi keranjang. Produk yang sudah tidak ada dilewati; baris kembar digabung.
router.put("/", async (req, res) => {
    const { items } = parse(z.object({
        items: z.array(z.object({
            productId: z.number().int().positive(),
            variant: z.string().max(50).optional(),
            quantity: z.number().int().min(1).max(99),
        })).max(MAX_LINES, `Keranjang maksimal ${MAX_LINES} produk.`),
    }), req.body)

    const existing = new Set((await prisma.product.findMany({
        where: { id: { in: items.map((item) => item.productId) } },
        select: { id: true },
    })).map((product) => product.id))

    const merged = new Map()
    for (const item of items) {
        if (!existing.has(item.productId)) continue
        const key = `${item.productId}:${item.variant ?? ""}`
        const quantity = Math.min(99, (merged.get(key)?.quantity ?? 0) + item.quantity)
        merged.set(key, { productId: item.productId, variant: item.variant ?? "", quantity })
    }

    const rows = await prisma.$transaction(async (tx) => {
        await tx.cartItem.deleteMany({ where: { userId: req.user.id } })
        await tx.cartItem.createMany({ data: [...merged.values()].map((item) => ({ ...item, userId: req.user.id })) })
        return tx.cartItem.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "asc" } })
    })
    res.json({ items: serializeCart(rows) })
})

export default router
