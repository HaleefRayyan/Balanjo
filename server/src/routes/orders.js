import crypto from "node:crypto"
import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { config } from "../config.js"
import { DELIVERY_FEE_PER_SELLER, DELIVERY_METHODS, PAYMENT_EXPIRY_MINUTES } from "../constants.js"
import { requireAuth } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializeOrder } from "../utils/serialize.js"
import { releaseStock, reserveStock } from "../utils/stock.js"
import { cancelTransaction, createSnapTransaction, midtransEnabled } from "../utils/midtrans.js"
import { closeUnpaidOrder, expireOverdueOrders, refreshPayment } from "../utils/payments.js"
import { background } from "../utils/notify.js"
import * as events from "../utils/events.js"

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
const withItems = { items: { include: itemDetails, orderBy: { id: "asc" } }, refunds: { orderBy: { id: "asc" } } }

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

    const products = await prisma.product.findMany({ where: { id: { in: items.map((item) => item.productId) } }, include: { variants: true } })
    const byId = new Map(products.map((product) => [product.id, product]))

    const lines = items.map((item) => {
        const product = byId.get(item.productId)
        if (!product) throw new HttpError(400, "Ada produk di keranjang yang sudah tidak tersedia.")
        if (product.sellerId === req.user.id) throw new HttpError(400, `Kamu tidak bisa membeli produkmu sendiri (${product.name}).`)
        const variants = product.variants.map((variant) => variant.name)
        if (variants.length && !variants.includes(item.variant)) {
            throw new HttpError(400, `Variasi untuk ${product.name} tidak valid.`)
        }
        return {
            productId: product.id,
            sellerId: product.sellerId,
            name: product.name,
            price: product.price,
            variant: variants.length ? item.variant : null, // produk tanpa variasi: variasi lama di keranjang diabaikan
            quantity: item.quantity,
            platformFee: Math.round(product.price * item.quantity * config.platformFeePercent / 100),
        }
    })
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
    // diantar: ongkos per seller (tiap seller mengantar pesanannya sendiri); ambil sendiri: gratis
    const sellerCount = new Set(lines.map((line) => line.sellerId)).size
    const shippingFee = delivery.method === "DELIVERY" ? DELIVERY_FEE_PER_SELLER * sellerCount : 0
    const total = subtotal + shippingFee

    // Stok (per variasi dan total produk) dikurangi dalam satu transaksi: kalau ada yang kurang, semuanya dibatalkan.
    const order = await prisma.$transaction(async (tx) => {
        await reserveStock(tx, lines)
        // dengan Midtrans: menunggu pembayaran (stok sudah dipesan sampai batas bayar);
        // tanpa Midtrans (development): langsung dianggap dibayar
        const now = new Date()
        return tx.order.create({
            data: {
                userId: req.user.id,
                createdAt: now,
                ...(midtransEnabled
                    ? { paymentStatus: "UNPAID", paymentExpiresAt: new Date(now.getTime() + PAYMENT_EXPIRY_MINUTES * 60_000) }
                    : { paymentStatus: "PAID", paidAt: now }),
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
    if (order.paymentStatus === "PAID") background(events.orderPaid(order.id))
    res.status(201).json({ order: serializeOrder(order) })
})

// Riwayat pesanan milik user yang login
router.get("/", async (req, res) => {
    await expireOverdueOrders({ userId: req.user.id })
    const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: withItems,
        orderBy: { createdAt: "desc" },
    })
    res.json({ orders: orders.map(serializeOrder) })
})

const findOwnOrder = async (req) => {
    const order = await prisma.order.findUnique({ where: { id: parseId(req.params.id) }, include: { items: true } })
    if (!order || order.userId !== req.user.id) throw notFound("Pesanan")
    return order
}

const sendOrder = async (res, id) => {
    const order = await prisma.order.findUnique({ where: { id }, include: withItems })
    res.json({ order: serializeOrder(order) })
}

// Token Snap untuk membayar (dibuat sekali, dipakai ulang sampai batas bayar)
router.post("/:id/pay", async (req, res) => {
    let order = await findOwnOrder(req)
    if (order.paymentStatus === "UNPAID") {
        await refreshPayment(order) // mungkin sudah dibayar / kedaluwarsa
        order = await findOwnOrder(req)
    }
    if (order.paymentStatus === "PAID") throw new HttpError(400, "Pesanan ini sudah dibayar.")
    if (order.paymentStatus !== "UNPAID") throw new HttpError(400, "Pesanan ini sudah ditutup. Silakan pesan ulang.")
    if (order.paymentToken) return res.json({ token: order.paymentToken })

    // order_id Midtrans unik per percobaan (database lokal & production berbagi akun sandbox yang sama)
    const ref = `BALANJO-${order.id}-${crypto.randomBytes(3).toString("hex")}`
    const snap = await createSnapTransaction({
        ref,
        order,
        user: req.user,
        expiryMinutes: Math.max(1, Math.ceil((order.paymentExpiresAt - order.createdAt) / 60_000)),
        finishUrl: `${config.clientUrl}/profile/orders`,
    })
    if (!snap) throw new HttpError(502, "Gagal menghubungi Midtrans. Coba lagi sebentar lagi.")
    // dua klik "Bayar" bersamaan: hanya token pertama yang disimpan
    const { count } = await prisma.order.updateMany({
        where: { id: order.id, paymentToken: null },
        data: { paymentRef: ref, paymentToken: snap.token },
    })
    const saved = count ? snap.token : (await findOwnOrder(req)).paymentToken
    res.json({ token: saved })
})

// Cek status pembayaran langsung ke Midtrans (setelah popup Snap ditutup)
router.post("/:id/refresh-payment", async (req, res) => {
    const order = await findOwnOrder(req)
    await refreshPayment(order).catch((error) => console.error(`Cek pembayaran pesanan ${order.id} gagal:`, error.message))
    await sendOrder(res, order.id)
})

// Belum dibayar: boleh dibatalkan kapan saja.
// Sudah dibayar lewat Midtrans: tidak bisa dibatalkan sendiri (uang perlu dikembalikan), hubungi seller.
// Tanpa pembayaran online (development / pesanan lama): boleh selama belum diproses seller.
router.post("/:id/cancel", async (req, res) => {
    const order = await findOwnOrder(req)
    if (order.paymentStatus === "UNPAID") {
        if (order.paymentRef) await cancelTransaction(order.paymentRef)
        await closeUnpaidOrder(order.id, "CANCELLED")
        return sendOrder(res, order.id)
    }
    if (order.items.every((item) => item.status === "CANCELLED")) throw new HttpError(400, "Pesanan ini sudah dibatalkan.")
    if (order.paymentRef) throw new HttpError(400, "Pesanan sudah dibayar. Hubungi seller untuk pembatalan dan pengembalian dana.")
    if (order.items.some((item) => item.status !== "PENDING")) {
        throw new HttpError(400, "Pesanan sudah diproses seller dan tidak bisa dibatalkan.")
    }
    // Batalkan semua item lalu kembalikan stoknya (kalau produknya masih ada).
    // Update hanya berlaku untuk item yang MASIH PENDING: kalau dua permintaan batal datang bersamaan
    // atau seller memproses di saat yang sama, hanya satu yang lolos (stok tidak kembali dua kali).
    await prisma.$transaction(async (tx) => {
        const { count } = await tx.orderItem.updateMany({ where: { orderId: order.id, status: "PENDING" }, data: { status: "CANCELLED" } })
        if (count !== order.items.length) throw new HttpError(409, "Status pesanan baru saja berubah. Muat ulang halaman.")
        await releaseStock(tx, order.items)
    })
    await sendOrder(res, order.id)
})

export default router
