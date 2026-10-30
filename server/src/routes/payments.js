import { Router } from "express"
import { prisma } from "../db.js"
import { config } from "../config.js"
import { getTransactionStatus, midtransEnabled, verifySignature } from "../utils/midtrans.js"
import { applyTransaction } from "../utils/payments.js"

const router = Router()

// Client key Midtrans boleh publik (dipakai snap.js di browser)
router.get("/config", (req, res) => {
    res.json({ enabled: midtransEnabled, clientKey: config.midtrans.clientKey, isProduction: config.midtrans.isProduction })
})

// Webhook "Payment Notification URL" di dashboard Midtrans.
// Tanda tangan dicek dulu, lalu status diambil ulang dari API Midtrans (sumber yang dipercaya).
router.post("/notify", async (req, res) => {
    if (!midtransEnabled || !verifySignature(req.body ?? {})) return res.status(403).json({ error: "Tanda tangan tidak valid." })

    const order = await prisma.order.findUnique({ where: { paymentRef: req.body.order_id } })
    // notifikasi uji dari dashboard Midtrans / pesanan dari database lain: cukup diterima
    if (!order) return res.json({ ok: true })

    const transaction = await getTransactionStatus(order.paymentRef)
    if (transaction) await applyTransaction(order, transaction)
    res.json({ ok: true })
})

export default router
