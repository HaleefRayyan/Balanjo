import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { isOwnerOrAdmin, requireAuth } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializeReview } from "../utils/serialize.js"
import { background } from "../utils/notify.js"
import * as events from "../utils/events.js"

const router = Router()
router.use(requireAuth)

// Ulasan hanya untuk item pesanan milik sendiri yang sudah Selesai, satu kali per item
router.post("/", async (req, res) => {
    const data = parse(z.object({
        orderItemId: z.number().int().positive(),
        rating: z.number().int().min(1, "Pilih rating 1-5 bintang.").max(5, "Pilih rating 1-5 bintang."),
        comment: z.string().trim().max(1000, "Ulasan maksimal 1000 karakter.").optional().default(""),
    }), req.body)

    const item = await prisma.orderItem.findUnique({
        where: { id: data.orderItemId },
        include: { order: { select: { userId: true } }, review: true },
    })
    if (!item || item.order.userId !== req.user.id) throw notFound("Item pesanan")
    if (item.status !== "DONE") throw new HttpError(400, "Ulasan bisa diberikan setelah pesanan selesai.")
    if (!item.productId) throw new HttpError(400, "Produk ini sudah dihapus seller.")
    if (item.review) throw new HttpError(409, "Kamu sudah memberi ulasan untuk pesanan ini.")

    const review = await prisma.review.create({
        data: { rating: data.rating, comment: data.comment, productId: item.productId, userId: req.user.id, orderItemId: item.id },
        include: { user: { select: { name: true, avatarUrl: true } }, orderItem: { select: { variant: true } } },
    })
    background(events.reviewCreated(review))
    res.status(201).json({ review: serializeReview(review) })
})

router.delete("/:id", async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: parseId(req.params.id) } })
    if (!review) throw notFound("Ulasan")
    if (!isOwnerOrAdmin(req.user, review.userId)) throw new HttpError(403, "Kamu tidak boleh menghapus ulasan ini.")
    await prisma.review.delete({ where: { id: review.id } })
    res.status(204).end()
})

export default router
