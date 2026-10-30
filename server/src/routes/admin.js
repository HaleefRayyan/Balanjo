import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { PAYMENT_STATUSES, PAYOUT_STATUSES, REFUND_STATUSES } from "../constants.js"
import { requireAdmin } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializeDelivery, serializeOrderItem, serializePayment, serializePayout, serializeRefund, serializeUser } from "../utils/serialize.js"
import { sellerEarnings } from "../utils/earnings.js"

const router = Router()
router.use(requireAdmin)

// Ringkasan: konten & user, plus uang yang lewat Midtrans
//   sales          = total pesanan yang dibayar online - refund
//   platformIncome = potongan platform dari item Selesai (yang sudah jadi hak Balanjo)
router.get("/stats", async (req, res) => {
    const onlinePaid = { paymentStatus: "PAID", paymentRef: { not: null } }
    const [users, sellers, blogs, forums, paidTotal, refunded, fees, pendingRefunds, pendingPayouts] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { products: { some: {} } } }),
        prisma.blog.count(),
        prisma.forumPost.count(),
        prisma.order.aggregate({ where: onlinePaid, _sum: { total: true } }),
        prisma.refund.aggregate({ _sum: { amount: true } }),
        prisma.orderItem.aggregate({ where: { status: "DONE", order: onlinePaid }, _sum: { platformFee: true } }),
        prisma.refund.count({ where: { status: "PENDING" } }),
        prisma.payout.count({ where: { status: "PENDING" } }),
    ])
    res.json({
        stats: {
            users, sellers, blogs, forums,
            sales: (paidTotal._sum.total ?? 0) - (refunded._sum.amount ?? 0),
            platformIncome: fees._sum.platformFee ?? 0,
            pendingRefunds,
            pendingPayouts,
        },
    })
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

// ---------- Semua pesanan ----------

const ORDERS_PAGE_SIZE = 20

router.get("/orders", async (req, res) => {
    const query = parse(z.object({
        payment: z.enum(PAYMENT_STATUSES).optional(),
        page: z.coerce.number().int().min(1).default(1),
    }), req.query)
    const where = query.payment ? { paymentStatus: query.payment } : {}
    const [total, orders] = await prisma.$transaction([
        prisma.order.count({ where }),
        prisma.order.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { seller: { select: { name: true } }, product: { select: { photoUrl: true } } }, orderBy: { id: "asc" } },
                refunds: { orderBy: { id: "asc" } },
            },
            orderBy: { createdAt: "desc" },
            skip: (query.page - 1) * ORDERS_PAGE_SIZE,
            take: ORDERS_PAGE_SIZE,
        }),
    ])
    res.json({
        orders: orders.map((order) => ({
            id: order.id,
            buyer: order.user,
            total: order.total,
            shippingFee: order.shippingFee,
            delivery: serializeDelivery(order),
            payment: serializePayment(order),
            items: order.items.map(serializeOrderItem),
            refunds: order.refunds.map(serializeRefund),
            createdAt: order.createdAt,
        })),
        total, page: query.page, pageSize: ORDERS_PAGE_SIZE,
    })
})

// ---------- Refund ke pembeli ----------
// Dikembalikan manual (refund di dashboard Midtrans, atau transfer setelah menghubungi pembeli),
// lalu ditandai REFUNDED dengan catatan.

router.get("/refunds", async (req, res) => {
    const { status } = parse(z.object({ status: z.enum(REFUND_STATUSES).optional() }), req.query)
    const refunds = await prisma.refund.findMany({
        where: status ? { status } : {},
        include: { order: { select: { paymentRef: true, paymentType: true, recipientName: true, phone: true, user: { select: { name: true, email: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 200,
    })
    res.json({
        refunds: refunds.map((refund) => ({
            ...serializeRefund(refund),
            buyer: { name: refund.order.user.name, email: refund.order.user.email, phone: refund.order.phone, recipientName: refund.order.recipientName },
            payment: { ref: refund.order.paymentRef, type: refund.order.paymentType },
        })),
    })
})

router.patch("/refunds/:id", async (req, res) => {
    const { note } = parse(z.object({ note: z.string().trim().max(300).optional().transform((value) => value || null) }), req.body)
    const id = parseId(req.params.id)
    const { count } = await prisma.refund.updateMany({
        where: { id, status: "PENDING" },
        data: { status: "REFUNDED", adminNote: note, processedById: req.user.id, processedAt: new Date() },
    })
    if (count === 0) {
        if (!(await prisma.refund.findUnique({ where: { id } }))) throw notFound("Refund")
        throw new HttpError(409, "Refund ini sudah diproses.")
    }
    res.json({ refund: serializeRefund(await prisma.refund.findUnique({ where: { id } })) })
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
