// Halaman toko seller (publik): profil singkat + ringkasan. Produknya lewat GET /api/products?sellerId=
import { Router } from "express"
import { prisma } from "../db.js"
import { notFound, parseId } from "../utils/http.js"

const router = Router()

router.get("/:id", async (req, res) => {
    const id = parseId(req.params.id)
    const seller = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, avatarUrl: true, createdAt: true } })
    const productCount = seller ? await prisma.product.count({ where: { sellerId: id } }) : 0
    // akun tanpa produk bukan toko
    if (!seller || productCount === 0) throw notFound("Toko")

    const [rating, sold] = await Promise.all([
        prisma.review.aggregate({ where: { product: { sellerId: id } }, _avg: { rating: true }, _count: { _all: true } }),
        prisma.orderItem.aggregate({ where: { sellerId: id, status: "DONE" }, _sum: { quantity: true } }),
    ])
    res.json({
        seller: {
            id: seller.id,
            name: seller.name,
            avatar: seller.avatarUrl,
            joinedAt: seller.createdAt,
            productCount,
            sold: sold._sum.quantity ?? 0,
            rating: {
                average: rating._count._all ? Math.round(rating._avg.rating * 10) / 10 : null,
                count: rating._count._all,
            },
        },
    })
})

export default router
