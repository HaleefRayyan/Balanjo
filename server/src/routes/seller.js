// "Toko Saya": setiap user yang login bisa berjualan. Semua endpoint di sini hanya
// menyentuh produk / penjualan / pengajuan banner milik user itu sendiri.
import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { DELIVERY_FEE_PER_SELLER, ORDER_ITEM_STATUSES, PAYOUT_METHODS, PAYOUT_MIN_AMOUNT, PRODUCT_CATEGORIES } from "../constants.js"
import { config } from "../config.js"
import { requireAuth } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { productInclude, serializeBannerRequest, serializeDelivery, serializeOrderItem, serializePayout, serializePayoutAccount, serializeProduct } from "../utils/serialize.js"
import { sellerEarnings } from "../utils/earnings.js"
import { MAX_PHOTOS, removeUpload, uploadImages } from "../utils/uploads.js"
import { releaseStock } from "../utils/stock.js"
import { expireOverdueOrders } from "../utils/payments.js"
import { background } from "../utils/notify.js"
import * as events from "../utils/events.js"

const router = Router()
router.use(requireAuth)

// ---------- Produk ----------

// Multipart: name, category, price, description, stock (tanpa variasi),
// variants = JSON [{ name, stock }] (stok per variasi; total produk = jumlahnya),
// photoOrder = JSON urutan foto akhir: URL foto lama yang dipertahankan atau "new:<i>" untuk file ke-i di "photos".
const jsonField = (schema) => z.string().optional().default("[]").transform((value, ctx) => {
    try {
        return JSON.parse(value)
    } catch {
        ctx.addIssue({ code: "custom", message: "Data form tidak valid." })
        return z.NEVER
    }
}).pipe(schema)

const productSchema = z.object({
    name: z.string().trim().min(1, "Nama produk wajib diisi.").max(100, "Nama produk maksimal 100 karakter."),
    category: z.enum(PRODUCT_CATEGORIES, { error: "Kategori tidak valid." }),
    price: z.coerce.number({ error: "Harga harus berupa angka." }).int("Harga harus bilangan bulat.")
        .min(100, "Harga minimal Rp100.").max(100_000_000, "Harga terlalu besar."),
    description: z.string().trim().min(1, "Deskripsi wajib diisi.").max(2000, "Deskripsi maksimal 2000 karakter."),
    stock: z.coerce.number({ error: "Stok harus berupa angka." }).int("Stok harus bilangan bulat.")
        .min(0, "Stok tidak boleh negatif.").max(100_000, "Stok terlalu besar."),
    variants: jsonField(z.array(z.object({
        name: z.string().trim().min(1, "Nama variasi wajib diisi.").max(30, "Nama variasi maksimal 30 karakter."),
        stock: z.number({ error: "Stok variasi harus berupa angka." }).int().min(0, "Stok tidak boleh negatif.").max(100_000, "Stok terlalu besar."),
    })).max(10, "Maksimal 10 variasi.")
        .refine((list) => new Set(list.map((variant) => variant.name.toLowerCase())).size === list.length, "Nama variasi tidak boleh sama.")),
    photoOrder: jsonField(z.array(z.string().max(500)).min(1, "Foto produk wajib diunggah.").max(MAX_PHOTOS, `Maksimal ${MAX_PHOTOS} foto per produk.`)),
})

// Urutan foto akhir dari photoOrder: foto lama (harus milik produk ini) atau file baru
const resolvePhotos = (order, uploaded, existing) => order.map((token) => {
    const match = token.match(/^new:(\d+)$/)
    const url = match ? uploaded[Number(match[1])]?.url : existing.find((photo) => photo === token)
    if (!url) throw new HttpError(400, "Foto produk tidak valid. Muat ulang halaman lalu coba lagi.")
    return url
})

// Simpan variasi & foto (dalam transaksi). Stok total = jumlah variasi kalau ada.
const saveDetails = async (tx, productId, data, photos) => {
    await tx.productVariant.deleteMany({ where: { productId, name: { notIn: data.variants.map((variant) => variant.name) } } })
    for (const [position, variant] of data.variants.entries()) {
        await tx.productVariant.upsert({
            where: { productId_name: { productId, name: variant.name } },
            create: { productId, name: variant.name, stock: variant.stock, position },
            update: { stock: variant.stock, position },
        })
    }
    await tx.productPhoto.deleteMany({ where: { productId } })
    await tx.productPhoto.createMany({ data: photos.map((url, position) => ({ productId, url, position })) })
}

const productFields = (data, photos) => ({
    name: data.name,
    category: data.category,
    price: data.price,
    description: data.description,
    stock: data.variants.length ? data.variants.reduce((sum, variant) => sum + variant.stock, 0) : data.stock,
    photoUrl: photos[0],
})

const findOwnProduct = async (req) => {
    const product = await prisma.product.findUnique({ where: { id: parseId(req.params.id) } })
    if (!product || product.sellerId !== req.user.id) throw notFound("Produk")
    return product
}

// Seller hanya melihat pesanan yang sudah dibayar
const paid = { order: { paymentStatus: "PAID" } }

// Ringkasan untuk Dashboard Seller Centre: pendapatan & jumlah pesanan (item yang dibatalkan tidak dihitung)
router.get("/stats", async (req, res) => {
    const items = await prisma.orderItem.findMany({
        where: { sellerId: req.user.id, status: { not: "CANCELLED" }, ...paid },
        select: { orderId: true, price: true, quantity: true },
    })
    // item dibayar yang belum diproses seller (badge "Pesanan" di Seller Centre)
    const toProcess = await prisma.orderItem.count({ where: { sellerId: req.user.id, status: "PENDING", ...paid } })
    res.json({
        stats: {
            revenue: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            orders: new Set(items.map((item) => item.orderId)).size,
            toProcess,
        },
    })
})

// Produk milik seller + jumlah terjual (item yang tidak dibatalkan)
router.get("/products", async (req, res) => {
    const [products, sales] = await Promise.all([
        prisma.product.findMany({
            where: { sellerId: req.user.id },
            include: productInclude,
            orderBy: { createdAt: "desc" },
        }),
        prisma.orderItem.groupBy({
            by: ["productId"],
            where: { sellerId: req.user.id, status: { not: "CANCELLED" }, productId: { not: null }, ...paid },
            _sum: { quantity: true },
        }),
    ])
    const sold = new Map(sales.map((row) => [row.productId, row._sum.quantity ?? 0]))
    res.json({ products: products.map((product) => ({ ...serializeProduct(product), sold: sold.get(product.id) ?? 0 })) })
})

// File baru yang tidak dipakai (atau semua, kalau gagal) dihapus lagi dari penyimpanan
const cleanupUploads = (files, keep = []) => Promise.all((files ?? []).filter((file) => !keep.includes(file.url)).map((file) => removeUpload(file.url)))

router.post("/products", uploadImages, async (req, res) => {
    try {
        const data = parse(productSchema, req.body)
        const photos = resolvePhotos(data.photoOrder, req.files ?? [], [])
        const product = await prisma.$transaction(async (tx) => {
            const created = await tx.product.create({ data: { ...productFields(data, photos), sellerId: req.user.id } })
            await saveDetails(tx, created.id, data, photos)
            return tx.product.findUnique({ where: { id: created.id }, include: productInclude })
        })
        await cleanupUploads(req.files, photos)
        res.status(201).json({ product: serializeProduct(product) })
    } catch (error) {
        await cleanupUploads(req.files)
        throw error
    }
})

// Foto lama yang tidak ada lagi di photoOrder dihapus dari penyimpanan
router.put("/products/:id", uploadImages, async (req, res) => {
    try {
        const product = await findOwnProduct(req)
        const data = parse(productSchema, req.body)
        const existing = (await prisma.productPhoto.findMany({ where: { productId: product.id } })).map((photo) => photo.url)
        if (existing.length === 0) existing.push(product.photoUrl)
        const photos = resolvePhotos(data.photoOrder, req.files ?? [], existing)
        const updated = await prisma.$transaction(async (tx) => {
            await tx.product.update({ where: { id: product.id }, data: productFields(data, photos) })
            await saveDetails(tx, product.id, data, photos)
            return tx.product.findUnique({ where: { id: product.id }, include: productInclude })
        })
        await cleanupUploads(req.files, photos)
        await Promise.all(existing.filter((url) => !photos.includes(url)).map(removeUpload))
        res.json({ product: serializeProduct(updated) })
    } catch (error) {
        await cleanupUploads(req.files)
        throw error
    }
})

// Riwayat pesanan tetap utuh (item menyimpan salinan nama, harga, dan seller).
// Banner yang sudah disetujui untuk produk ini ikut turun dari slider.
router.delete("/products/:id", async (req, res) => {
    const product = await findOwnProduct(req)
    const photos = (await prisma.productPhoto.findMany({ where: { productId: product.id } })).map((photo) => photo.url)
    const requests = await prisma.bannerRequest.findMany({ where: { productId: product.id }, include: { banner: true } })
    const banners = requests.map((request) => request.banner).filter(Boolean)

    await prisma.$transaction([
        prisma.banner.deleteMany({ where: { id: { in: banners.map((banner) => banner.id) } } }),
        prisma.product.delete({ where: { id: product.id } }), // bannerRequest ikut terhapus (cascade)
    ])
    await Promise.all([
        ...[...new Set([product.photoUrl, ...photos])].map(removeUpload),
        ...requests.map((request) => removeUpload(request.imageUrl)),
        ...banners.map((banner) => removeUpload(banner.imageUrl)),
    ])
    res.status(204).end()
})

// ---------- Pesanan masuk ----------

// Item penjualan dikelompokkan per pesanan: [{ orderId, createdAt, buyer, items: [...] }]
router.get("/orders", async (req, res) => {
    await expireOverdueOrders({ items: { some: { sellerId: req.user.id } } }) // yang dibayar di detik terakhir ikut tampil
    const items = await prisma.orderItem.findMany({
        where: { sellerId: req.user.id, ...paid },
        include: {
            product: { select: { photoUrl: true } },
            order: {
                select: {
                    id: true, createdAt: true, deliveryMethod: true, recipientName: true, phone: true, address: true, note: true,
                    user: { select: { name: true, email: true } },
                },
            },
        },
        orderBy: [{ order: { createdAt: "desc" } }, { id: "asc" }],
    })

    const groups = new Map()
    for (const item of items) {
        if (!groups.has(item.orderId)) {
            groups.set(item.orderId, {
                orderId: item.orderId,
                createdAt: item.order.createdAt,
                buyer: { name: item.order.user.name, email: item.order.user.email },
                delivery: serializeDelivery(item.order),
                items: [],
            })
        }
        groups.get(item.orderId).items.push(serializeOrderItem(item))
    }
    res.json({ orders: [...groups.values()] })
})

// Alur status: PENDING -> PROCESSING -> SHIPPED -> DONE (boleh lompat maju).
// CANCELLED hanya sebelum dikirim. DONE / CANCELLED sudah final.
const rank = (status) => ORDER_ITEM_STATUSES.indexOf(status)

router.patch("/order-items/:id", async (req, res) => {
    const { status } = parse(z.object({ status: z.enum(ORDER_ITEM_STATUSES, { error: "Status tidak valid." }) }), req.body)
    const item = await prisma.orderItem.findUnique({ where: { id: parseId(req.params.id) }, include: { order: { select: { paymentStatus: true, paymentRef: true, deliveryMethod: true } } } })
    if (!item || item.sellerId !== req.user.id || item.order.paymentStatus !== "PAID") throw notFound("Item pesanan")

    if (item.status === "DONE" || item.status === "CANCELLED") {
        throw new HttpError(400, "Pesanan yang sudah selesai atau dibatalkan tidak bisa diubah.")
    }
    if (status === "CANCELLED" && rank(item.status) >= rank("SHIPPED")) {
        throw new HttpError(400, "Pesanan yang sudah dikirim tidak bisa dibatalkan.")
    }
    if (status !== "CANCELLED" && rank(status) <= rank(item.status)) {
        throw new HttpError(400, "Status hanya bisa maju (Diproses → Dikirim → Selesai).")
    }

    // Hanya berlaku kalau status belum berubah sejak dibaca (mis. pembeli membatalkan bersamaan).
    // Dibatalkan seller -> stok dikembalikan (kalau produknya masih ada).
    // Sudah dibayar online -> refund dibuat untuk admin: harga item, ditambah ongkos antar
    // kalau tidak ada lagi item seller ini yang tersisa di pesanan (tidak jadi diantar).
    const updated = await prisma.$transaction(async (tx) => {
        const { count } = await tx.orderItem.updateMany({ where: { id: item.id, status: item.status }, data: { status } })
        if (count === 0) throw new HttpError(409, "Status pesanan baru saja berubah. Muat ulang halaman.")
        if (status === "CANCELLED") await releaseStock(tx, [item])
        let refund = null
        if (status === "CANCELLED" && item.order.paymentRef) {
            const remaining = await tx.orderItem.count({ where: { orderId: item.orderId, sellerId: req.user.id, status: { not: "CANCELLED" } } })
            const shipping = item.order.deliveryMethod === "DELIVERY" && remaining === 0 ? DELIVERY_FEE_PER_SELLER : 0
            refund = await tx.refund.create({
                data: {
                    key: `item:${item.id}`,
                    orderId: item.orderId,
                    orderItemId: item.id,
                    amount: item.price * item.quantity + shipping,
                    reason: "SELLER_CANCELLED",
                    description: `${item.name}${item.variant ? ` (${item.variant})` : ""} × ${item.quantity} dibatalkan seller${shipping ? " + ongkos antar" : ""}`,
                },
            })
        }
        const saved = await tx.orderItem.findUnique({ where: { id: item.id }, include: { product: { select: { photoUrl: true } } } })
        return { saved, refund }
    })
    background(events.itemStatusChanged(item.id, status, updated.refund))
    res.json({ item: serializeOrderItem(updated.saved) })
})

// ---------- Penghasilan & payout ----------

router.get("/payouts", async (req, res) => {
    const [{ summary, entries }, payouts] = await Promise.all([
        sellerEarnings(req.user.id),
        prisma.payout.findMany({ where: { sellerId: req.user.id }, orderBy: { createdAt: "desc" } }),
    ])
    res.json({
        summary: { ...summary, feePercent: config.platformFeePercent, minAmount: PAYOUT_MIN_AMOUNT },
        account: serializePayoutAccount(req.user),
        payouts: payouts.map(serializePayout),
        entries,
    })
})

const accountSchema = z.object({
    method: z.enum(PAYOUT_METHODS, { error: "Pilih bank / e-wallet." }),
    accountNumber: z.string().transform((value) => value.replace(/[\s-]/g, ""))
        .refine((value) => /^\d{5,20}$/.test(value), "Nomor rekening / HP harus 5-20 angka."),
    accountName: z.string().trim().min(2, "Nama pemilik rekening wajib diisi.").max(80),
})

router.put("/payout-account", async (req, res) => {
    const data = parse(accountSchema, req.body)
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { payoutMethod: data.method, payoutAccountNumber: data.accountNumber, payoutAccountName: data.accountName },
    })
    res.json({ account: serializePayoutAccount(user) })
})

// Ajukan penarikan. Satu pengajuan PENDING per seller (dijaga juga oleh unique index di database).
router.post("/payouts", async (req, res) => {
    const { amount } = parse(z.object({
        amount: z.number({ error: "Jumlah harus berupa angka." }).int("Jumlah harus bilangan bulat.")
            .min(PAYOUT_MIN_AMOUNT, `Minimal penarikan Rp${PAYOUT_MIN_AMOUNT.toLocaleString("id-ID")}.`),
    }), req.body)
    if (!req.user.payoutMethod) throw new HttpError(400, "Isi rekening / e-wallet tujuan dulu.")
    if (await prisma.payout.count({ where: { sellerId: req.user.id, status: "PENDING" } })) {
        throw new HttpError(400, "Masih ada pengajuan yang sedang diproses.")
    }
    const { summary } = await sellerEarnings(req.user.id)
    if (amount > summary.balance) throw new HttpError(400, `Saldo yang bisa ditarik Rp${summary.balance.toLocaleString("id-ID")}.`)

    try {
        const payout = await prisma.payout.create({
            data: {
                sellerId: req.user.id,
                amount,
                method: req.user.payoutMethod,
                accountNumber: req.user.payoutAccountNumber,
                accountName: req.user.payoutAccountName,
            },
        })
        background(events.payoutRequested(payout, req.user.name))
        res.status(201).json({ payout: serializePayout(payout) })
    } catch (error) {
        if (error.code === "P2002") throw new HttpError(409, "Masih ada pengajuan yang sedang diproses.")
        throw error
    }
})

// ---------- Pengajuan banner milik seller ----------
// (membuat pengajuan: POST /api/banners/requests)

router.get("/banner-requests", async (req, res) => {
    const requests = await prisma.bannerRequest.findMany({
        where: { sellerId: req.user.id },
        include: { product: { select: { id: true, name: true } }, seller: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
    })
    res.json({ requests: requests.map(serializeBannerRequest) })
})

export default router
