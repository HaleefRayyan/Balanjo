import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { PRODUCT_CATEGORIES } from "../constants.js"
import { notFound, parse, parseId } from "../utils/http.js"
import { serializeProduct, serializeReview } from "../utils/serialize.js"

const router = Router()
const withSeller = { seller: { select: { name: true } } }

// { productId: { average, count } } dari tabel ulasan, untuk produk yang sedang ditampilkan
const ratingsFor = async (productIds) => {
    if (productIds.length === 0) return new Map()
    const rows = await prisma.review.groupBy({
        by: ["productId"],
        where: { productId: { in: productIds } },
        _avg: { rating: true },
        _count: { _all: true },
    })
    return new Map(rows.map((row) => [row.productId, { average: Math.round(row._avg.rating * 10) / 10, count: row._count._all }]))
}

// ?q=&category=&page=&pageSize=  atau  ?ids=1,2,3 (untuk keranjang)
router.get("/", async (req, res) => {
    const query = parse(z.object({
        q: z.string().trim().max(100).optional(),
        // kategori dicocokkan tanpa peduli huruf besar/kecil (URL bisa /category/fashion)
        category: z.string().optional().transform((value) => value && PRODUCT_CATEGORIES.find((c) => c.toLowerCase() === value.toLowerCase())),
        ids: z.string().regex(/^\d+(,\d+)*$/, "ids harus berupa angka dipisah koma").optional(),
        excludeId: z.coerce.number().int().optional(),
        page: z.coerce.number().int().min(1).default(1),
        pageSize: z.coerce.number().int().min(1).max(50).default(8),
    }), req.query)

    // kategori dikirim tapi tidak dikenal -> hasil kosong, bukan semua produk
    if (req.query.category && !query.category) return res.json({ products: [], total: 0, page: 1, pageSize: query.pageSize })

    const where = {
        ...(query.category && { category: query.category }),
        ...(query.q && { name: { contains: query.q, mode: "insensitive" } }),
        ...(query.ids && { id: { in: query.ids.split(",").map(Number) } }),
        ...(query.excludeId && { NOT: { id: query.excludeId } }),
    }
    const [total, products] = await prisma.$transaction([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            include: withSeller,
            orderBy: { id: "asc" },
            skip: query.ids ? undefined : (query.page - 1) * query.pageSize,
            take: query.ids ? undefined : query.pageSize,
        }),
    ])
    const ratings = await ratingsFor(products.map((product) => product.id))
    res.json({
        products: products.map((product) => serializeProduct(product, ratings.get(product.id))),
        total, page: query.page, pageSize: query.pageSize,
    })
})

router.get("/:id", async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: parseId(req.params.id) }, include: withSeller })
    if (!product) throw notFound("Produk")
    const ratings = await ratingsFor([product.id])
    res.json({ product: serializeProduct(product, ratings.get(product.id)) })
})

// Ulasan produk, terbaru dulu
router.get("/:id/reviews", async (req, res) => {
    const reviews = await prisma.review.findMany({
        where: { productId: parseId(req.params.id) },
        include: { user: { select: { name: true, avatarUrl: true } }, orderItem: { select: { variant: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
    })
    res.json({ reviews: reviews.map(serializeReview) })
})

export default router
