import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { PRODUCT_CATEGORIES } from "../constants.js"
import { notFound, parse, parseId } from "../utils/http.js"
import { productInclude, serializeProduct, serializeReview } from "../utils/serialize.js"

const router = Router()

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

const SORTS = {
    newest: [{ createdAt: "desc" }, { id: "desc" }],
    price_asc: [{ price: "asc" }, { id: "asc" }],
    price_desc: [{ price: "desc" }, { id: "asc" }],
}

// ?q=&category=&page=&pageSize=&sort=&minPrice=&maxPrice=  atau  ?ids=1,2,3 (untuk keranjang)
// sort: newest | price_asc | price_desc | rating (tanpa sort: urutan tetap per id)
router.get("/", async (req, res) => {
    const query = parse(z.object({
        q: z.string().trim().max(100).optional(),
        // kategori dicocokkan tanpa peduli huruf besar/kecil (URL bisa /category/fashion)
        category: z.string().optional().transform((value) => value && PRODUCT_CATEGORIES.find((c) => c.toLowerCase() === value.toLowerCase())),
        ids: z.string().regex(/^\d+(,\d+)*$/, "ids harus berupa angka dipisah koma").optional(),
        excludeId: z.coerce.number().int().optional(),
        sellerId: z.coerce.number().int().positive().optional(),
        page: z.coerce.number().int().min(1).default(1),
        pageSize: z.coerce.number().int().min(1).max(50).default(8),
        sort: z.enum(["newest", "price_asc", "price_desc", "rating"]).optional(),
        minPrice: z.coerce.number().int().min(0).optional(),
        maxPrice: z.coerce.number().int().min(0).optional(),
    }), req.query)

    // kategori dikirim tapi tidak dikenal -> hasil kosong, bukan semua produk
    if (req.query.category && !query.category) return res.json({ products: [], total: 0, page: 1, pageSize: query.pageSize })

    const where = {
        ...(query.category && { category: query.category }),
        ...(query.q && { name: { contains: query.q, mode: "insensitive" } }),
        ...(query.ids && { id: { in: query.ids.split(",").map(Number) } }),
        ...(query.excludeId && { NOT: { id: query.excludeId } }),
        ...(query.sellerId && { sellerId: query.sellerId }),
        ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
            price: { ...(query.minPrice !== undefined && { gte: query.minPrice }), ...(query.maxPrice !== undefined && { lte: query.maxPrice }) },
        }),
    }

    // rating: dihitung dari tabel ulasan, jadi diurutkan di sini lalu dipotong per halaman
    // (cukup untuk katalog kampus; produk tanpa ulasan di belakang)
    if (query.sort === "rating" && !query.ids) {
        const all = await prisma.product.findMany({ where, select: { id: true } })
        const allRatings = await ratingsFor(all.map((product) => product.id))
        const ranked = all.map((product) => ({ id: product.id, ...(allRatings.get(product.id) ?? { average: 0, count: 0 }) }))
            .sort((a, b) => b.average - a.average || b.count - a.count || a.id - b.id)
        const pageIds = ranked.slice((query.page - 1) * query.pageSize, query.page * query.pageSize).map((product) => product.id)
        const pageProducts = await prisma.product.findMany({ where: { id: { in: pageIds } }, include: productInclude })
        const byId = new Map(pageProducts.map((product) => [product.id, product]))
        return res.json({
            products: pageIds.filter((id) => byId.has(id)).map((id) => serializeProduct(byId.get(id), allRatings.get(id))),
            total: ranked.length, page: query.page, pageSize: query.pageSize,
        })
    }

    const [total, products] = await prisma.$transaction([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            include: productInclude,
            orderBy: SORTS[query.sort] ?? { id: "asc" },
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
    const product = await prisma.product.findUnique({ where: { id: parseId(req.params.id) }, include: productInclude })
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
