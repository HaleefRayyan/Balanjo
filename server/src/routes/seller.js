// "Toko Saya": setiap user yang login bisa berjualan. Semua endpoint di sini hanya
// menyentuh produk / penjualan / pengajuan banner milik user itu sendiri.
import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { ORDER_ITEM_STATUSES, PRODUCT_CATEGORIES } from "../constants.js"
import { requireAuth } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializeBannerRequest, serializeOrderItem, serializeProduct } from "../utils/serialize.js"
import { fileUrl, removeUpload, uploadImage } from "../utils/uploads.js"

const router = Router()
router.use(requireAuth)

// ---------- Produk ----------

// variants dikirim sebagai teks dipisah koma: "Hitam, Coklat"
const productSchema = z.object({
    name: z.string().trim().min(1, "Nama produk wajib diisi.").max(100, "Nama produk maksimal 100 karakter."),
    category: z.enum(PRODUCT_CATEGORIES, { error: "Kategori tidak valid." }),
    price: z.coerce.number({ error: "Harga harus berupa angka." }).int("Harga harus bilangan bulat.")
        .min(100, "Harga minimal Rp100.").max(100_000_000, "Harga terlalu besar."),
    description: z.string().trim().min(1, "Deskripsi wajib diisi.").max(2000, "Deskripsi maksimal 2000 karakter."),
    stock: z.coerce.number({ error: "Stok harus berupa angka." }).int("Stok harus bilangan bulat.")
        .min(0, "Stok tidak boleh negatif.").max(100_000, "Stok terlalu besar."),
    variants: z.string().optional().default("").transform((value) =>
        [...new Set(value.split(",").map((variant) => variant.trim()).filter(Boolean))])
        .refine((list) => list.length <= 10, "Maksimal 10 variasi.")
        .refine((list) => list.every((variant) => variant.length <= 30), "Nama variasi maksimal 30 karakter."),
})

const findOwnProduct = async (req) => {
    const product = await prisma.product.findUnique({ where: { id: parseId(req.params.id) } })
    if (!product || product.sellerId !== req.user.id) throw notFound("Produk")
    return product
}

router.get("/products", async (req, res) => {
    const products = await prisma.product.findMany({
        where: { sellerId: req.user.id },
        include: { seller: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
    })
    res.json({ products: products.map(serializeProduct) })
})

router.post("/products", uploadImage, async (req, res) => {
    try {
        const data = parse(productSchema, req.body)
        if (!req.file) throw new HttpError(400, "Foto produk wajib diunggah.")
        const product = await prisma.product.create({
            data: { ...data, variants: JSON.stringify(data.variants), photoUrl: fileUrl(req.file), sellerId: req.user.id },
            include: { seller: { select: { name: true } } },
        })
        res.status(201).json({ product: serializeProduct(product) })
    } catch (error) {
        if (req.file) await removeUpload(fileUrl(req.file))
        throw error
    }
})

// foto opsional saat edit; kalau diganti, foto lama dihapus
router.put("/products/:id", uploadImage, async (req, res) => {
    try {
        const product = await findOwnProduct(req)
        const data = parse(productSchema, req.body)
        const updated = await prisma.product.update({
            where: { id: product.id },
            data: { ...data, variants: JSON.stringify(data.variants), ...(req.file && { photoUrl: fileUrl(req.file) }) },
            include: { seller: { select: { name: true } } },
        })
        if (req.file) await removeUpload(product.photoUrl)
        res.json({ product: serializeProduct(updated) })
    } catch (error) {
        if (req.file) await removeUpload(fileUrl(req.file))
        throw error
    }
})

// Riwayat pesanan tetap utuh (item menyimpan salinan nama, harga, dan seller).
// Banner yang sudah disetujui untuk produk ini ikut turun dari slider.
router.delete("/products/:id", async (req, res) => {
    const product = await findOwnProduct(req)
    const requests = await prisma.bannerRequest.findMany({ where: { productId: product.id }, include: { banner: true } })
    const banners = requests.map((request) => request.banner).filter(Boolean)

    await prisma.$transaction([
        prisma.banner.deleteMany({ where: { id: { in: banners.map((banner) => banner.id) } } }),
        prisma.product.delete({ where: { id: product.id } }), // bannerRequest ikut terhapus (cascade)
    ])
    await Promise.all([
        removeUpload(product.photoUrl),
        ...requests.map((request) => removeUpload(request.imageUrl)),
        ...banners.map((banner) => removeUpload(banner.imageUrl)),
    ])
    res.status(204).end()
})

// ---------- Pesanan masuk ----------

// Item penjualan dikelompokkan per pesanan: [{ orderId, createdAt, buyer, items: [...] }]
router.get("/orders", async (req, res) => {
    const items = await prisma.orderItem.findMany({
        where: { sellerId: req.user.id },
        include: {
            product: { select: { photoUrl: true } },
            order: { select: { id: true, createdAt: true, user: { select: { name: true, email: true } } } },
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
    const item = await prisma.orderItem.findUnique({ where: { id: parseId(req.params.id) } })
    if (!item || item.sellerId !== req.user.id) throw notFound("Item pesanan")

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
    const updated = await prisma.$transaction(async (tx) => {
        const { count } = await tx.orderItem.updateMany({ where: { id: item.id, status: item.status }, data: { status } })
        if (count === 0) throw new HttpError(409, "Status pesanan baru saja berubah. Muat ulang halaman.")
        if (status === "CANCELLED" && item.productId) {
            await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
        }
        return tx.orderItem.findUnique({ where: { id: item.id }, include: { product: { select: { photoUrl: true } } } })
    })
    res.json({ item: serializeOrderItem(updated) })
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
