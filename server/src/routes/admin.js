import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { PAYOUT_STATUSES } from "../constants.js"
import { requireAdmin } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializePayout, serializeUser } from "../utils/serialize.js"
import { sellerEarnings } from "../utils/earnings.js"

const router = Router()
router.use(requireAdmin)

router.get("/stats", async (req, res) => {
    const [users, sellers, blogs, forums] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { products: { some: {} } } }),
        prisma.blog.count(),
        prisma.forumPost.count(),
    ])
    res.json({ stats: { users, sellers, blogs, forums } })
})

router.get("/users", async (req, res) => {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } })
    res.json({ users: users.map(serializeUser) })
})

// Menghapus user ikut menghapus blog, diskusi, balasan, dan pesanannya (onDelete: Cascade)
router.delete("/users/:id", async (req, res) => {
    const id = parseId(req.params.id)
    if (id === req.user.id) throw new HttpError(400, "Kamu tidak bisa menghapus akunmu sendiri.")
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw notFound("User")
    await prisma.user.delete({ where: { id } })
    res.status(204).end()
})

// ---------- Payout seller ----------
// Admin mentransfer manual (bank / e-wallet), lalu menandai Dibayar dengan catatan (mis. no. referensi).
// Ditolak -> jumlahnya kembali ke saldo seller.

const sellerSelect = { select: { id: true, name: true, email: true } }

router.get("/payouts", async (req, res) => {
    const { status } = parse(z.object({ status: z.enum(PAYOUT_STATUSES).optional() }), req.query)
    const payouts = await prisma.payout.findMany({
        where: status ? { status } : {},
        include: { seller: sellerSelect },
        orderBy: { createdAt: "desc" },
        take: 200,
    })
    res.json({ payouts: payouts.map(serializePayout) })
})

// Ringkasan saldo seller (dicek admin sebelum mentransfer)
router.get("/payouts/:id/seller-summary", async (req, res) => {
    const payout = await prisma.payout.findUnique({ where: { id: parseId(req.params.id) } })
    if (!payout) throw notFound("Pengajuan payout")
    const { summary } = await sellerEarnings(payout.sellerId)
    res.json({ summary })
})

router.patch("/payouts/:id", async (req, res) => {
    const { status, note } = parse(z.object({
        status: z.enum(["PAID", "REJECTED"], { error: "Status tidak valid." }),
        note: z.string().trim().max(300).optional().transform((value) => value || null),
    }).refine((data) => data.status !== "REJECTED" || data.note, { message: "Tulis alasan penolakan." }), req.body)
    const id = parseId(req.params.id)
    const { count } = await prisma.payout.updateMany({
        where: { id, status: "PENDING" },
        data: { status, adminNote: note, processedById: req.user.id, processedAt: new Date() },
    })
    if (count === 0) {
        if (!(await prisma.payout.findUnique({ where: { id } }))) throw notFound("Pengajuan payout")
        throw new HttpError(409, "Pengajuan ini sudah diproses.")
    }
    const payout = await prisma.payout.findUnique({ where: { id }, include: { seller: sellerSelect } })
    res.json({ payout: serializePayout(payout) })
})

export default router
