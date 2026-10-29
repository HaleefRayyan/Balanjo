import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { requireAuth } from "../middleware/auth.js"
import { HttpError, parse } from "../utils/http.js"
import { serializeOrder } from "../utils/serialize.js"

const router = Router()
router.use(requireAuth)

// Harga selalu dihitung ulang di server dari database, bukan dari keranjang di browser
router.post("/", async (req, res) => {
    const { items } = parse(z.object({
        items: z.array(z.object({
            productId: z.number().int().positive(),
            variant: z.string().max(50).optional(),
            quantity: z.number().int().min(1).max(99),
        })).min(1, "Keranjang kosong.").max(50),
    }), req.body)

    const products = await prisma.product.findMany({ where: { id: { in: items.map((item) => item.productId) } } })
    const byId = new Map(products.map((product) => [product.id, product]))

    const lines = items.map((item) => {
        const product = byId.get(item.productId)
        if (!product) throw new HttpError(400, "Ada produk di keranjang yang sudah tidak tersedia.")
        const variants = JSON.parse(product.variants)
        if (variants.length && !variants.includes(item.variant)) {
            throw new HttpError(400, `Variasi untuk ${product.name} tidak valid.`)
        }
        return { productId: product.id, name: product.name, price: product.price, variant: item.variant ?? null, quantity: item.quantity }
    })
    const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)

    const order = await prisma.order.create({
        data: { userId: req.user.id, total, items: { create: lines } },
        include: { items: true },
    })
    res.status(201).json({ order: serializeOrder(order) })
})

router.get("/", async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
    })
    res.json({ orders: orders.map(serializeOrder) })
})

export default router
