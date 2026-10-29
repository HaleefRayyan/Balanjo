import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { requireAuth } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializeOrder } from "../utils/serialize.js"

const router = Router()
router.use(requireAuth)

const itemDetails = { product: { select: { photoUrl: true } }, seller: { select: { name: true } } }
const withItems = { items: { include: itemDetails, orderBy: { id: "asc" } } }

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
        if (product.sellerId === req.user.id) throw new HttpError(400, `Kamu tidak bisa membeli produkmu sendiri (${product.name}).`)
        const variants = JSON.parse(product.variants)
        if (variants.length && !variants.includes(item.variant)) {
            throw new HttpError(400, `Variasi untuk ${product.name} tidak valid.`)
        }
        return {
            productId: product.id,
            sellerId: product.sellerId,
            name: product.name,
            price: product.price,
            variant: item.variant ?? null,
            quantity: item.quantity,
        }
    })
    const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)

    const order = await prisma.order.create({
        data: { userId: req.user.id, total, items: { create: lines } },
        include: withItems,
    })
    res.status(201).json({ order: serializeOrder(order) })
})

// Riwayat pesanan milik user yang login
router.get("/", async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: withItems,
        orderBy: { createdAt: "desc" },
    })
    res.json({ orders: orders.map(serializeOrder) })
})

// Pembeli bisa membatalkan selama belum ada seller yang memproses (semua item masih PENDING)
router.post("/:id/cancel", async (req, res) => {
    const order = await prisma.order.findUnique({ where: { id: parseId(req.params.id) }, include: { items: true } })
    if (!order || order.userId !== req.user.id) throw notFound("Pesanan")
    if (order.items.some((item) => item.status !== "PENDING")) {
        throw new HttpError(400, "Pesanan sudah diproses seller dan tidak bisa dibatalkan.")
    }
    await prisma.orderItem.updateMany({ where: { orderId: order.id }, data: { status: "CANCELLED" } })
    const updated = await prisma.order.findUnique({ where: { id: order.id }, include: withItems })
    res.json({ order: serializeOrder(updated) })
})

export default router
