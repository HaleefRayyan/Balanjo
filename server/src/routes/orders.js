import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { DELIVERY_FEE_PER_SELLER, DELIVERY_METHODS } from "../constants.js"
import { requireAuth } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializeOrder } from "../utils/serialize.js"

const router = Router()
router.use(requireAuth)

const itemDetails = {
    product: { select: { photoUrl: true } },
    seller: { select: { name: true } },
    review: { select: { id: true, rating: true } },
}

// Nomor HP Indonesia: 08xx / 628xx / +628xx, spasi & tanda hubung diabaikan
const phone = z.string().transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => /^(\+62|62|0)8\d{7,12}$/.test(value), "Nomor HP/WhatsApp tidak valid (contoh: 081234567890).")

const deliverySchema = z.object({
    method: z.enum(DELIVERY_METHODS, { error: "Pilih cara pengiriman." }),
    recipientName: z.string().trim().min(1, "Nama penerima wajib diisi.").max(80),
    phone,
    address: z.string().trim().max(300).optional().transform((value) => value || null),
    note: z.string().trim().max(300).optional().transform((value) => value || null),
}).refine((data) => data.method !== "DELIVERY" || (data.address && data.address.length >= 5), {
    message: "Isi titik temu / alamat pengantaran (minimal 5 karakter).",
})
const withItems = { items: { include: itemDetails, orderBy: { id: "asc" } } }

// Harga selalu dihitung ulang di server dari database, bukan dari keranjang di browser
router.post("/", async (req, res) => {
    const { items, delivery } = parse(z.object({
        delivery: deliverySchema,
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
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
    // diantar: ongkos per seller (tiap seller mengantar pesanannya sendiri); ambil sendiri: gratis
    const sellerCount = new Set(lines.map((line) => line.sellerId)).size
    const shippingFee = delivery.method === "DELIVERY" ? DELIVERY_FEE_PER_SELLER * sellerCount : 0
    const total = subtotal + shippingFee

    // jumlah per produk (variasi berbeda dari produk yang sama memakai stok yang sama)
    const needed = new Map()
    for (const line of lines) needed.set(line.productId, (needed.get(line.productId) ?? 0) + line.quantity)

    // Stok dikurangi dalam satu transaksi: kalau ada yang kurang, semuanya dibatalkan.
    // `stock >= jumlah` dicek di query update sendiri, jadi dua pembeli tidak bisa mengambil stok terakhir bersamaan.
    const order = await prisma.$transaction(async (tx) => {
        for (const [productId, quantity] of needed) {
            const { count } = await tx.product.updateMany({
                where: { id: productId, stock: { gte: quantity } },
                data: { stock: { decrement: quantity } },
            })
            if (count === 0) {
                const product = byId.get(productId)
                const left = (await tx.product.findUnique({ where: { id: productId } }))?.stock ?? 0
                throw new HttpError(400, left > 0 ? `Stok ${product.name} tinggal ${left}.` : `Stok ${product.name} habis.`)
            }
        }
        return tx.order.create({
            data: {
                userId: req.user.id,
                total,
                shippingFee,
                deliveryMethod: delivery.method,
                recipientName: delivery.recipientName,
                phone: delivery.phone,
                address: delivery.method === "DELIVERY" ? delivery.address : null,
                note: delivery.note,
                items: { create: lines },
            },
            include: withItems,
        })
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
    if (order.items.every((item) => item.status === "CANCELLED")) throw new HttpError(400, "Pesanan ini sudah dibatalkan.")
    if (order.items.some((item) => item.status !== "PENDING")) {
        throw new HttpError(400, "Pesanan sudah diproses seller dan tidak bisa dibatalkan.")
    }
    // Batalkan semua item lalu kembalikan stoknya (kalau produknya masih ada).
    // Update hanya berlaku untuk item yang MASIH PENDING: kalau dua permintaan batal datang bersamaan
    // atau seller memproses di saat yang sama, hanya satu yang lolos (stok tidak kembali dua kali).
    await prisma.$transaction(async (tx) => {
        const { count } = await tx.orderItem.updateMany({ where: { orderId: order.id, status: "PENDING" }, data: { status: "CANCELLED" } })
        if (count !== order.items.length) throw new HttpError(409, "Status pesanan baru saja berubah. Muat ulang halaman.")
        for (const item of order.items.filter((line) => line.productId)) {
            await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
        }
    })
    const updated = await prisma.order.findUnique({ where: { id: order.id }, include: withItems })
    res.json({ order: serializeOrder(updated) })
})

export default router
