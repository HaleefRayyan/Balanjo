import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { PRODUCT_CATEGORIES } from "../constants.js"
import { notFound, parse, parseId } from "../utils/http.js"
import { serializeProduct } from "../utils/serialize.js"

const router = Router()
const withSeller = { seller: { select: { name: true } } }

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
        ...(query.q && { name: { contains: query.q } }),
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
    res.json({ products: products.map(serializeProduct), total, page: query.page, pageSize: query.pageSize })
})

router.get("/:id", async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: parseId(req.params.id) }, include: withSeller })
    if (!product) throw notFound("Produk")
    res.json({ product: serializeProduct(product) })
})

export default router
