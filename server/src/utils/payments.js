// Perubahan status pembayaran pesanan. Dipakai oleh webhook Midtrans, cek status manual, dan kedaluwarsa.
// Semua update bersyarat (updateMany ... where status lama), jadi notifikasi ganda / bersamaan aman.
import { prisma } from "../db.js"
import { getTransactionStatus, midtransEnabled, toPaymentStatus } from "./midtrans.js"
import { background } from "./notify.js"
import { releaseStock } from "./stock.js"
import * as events from "./events.js"

const GRACE_MS = 60_000 // jeda setelah batas bayar sebelum dianggap kedaluwarsa (jam server vs Midtrans)

// Pesanan belum dibayar -> EXPIRED / FAILED / CANCELLED: semua item dibatalkan dan stok dikembalikan
export const closeUnpaidOrder = (orderId, paymentStatus) => prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({ where: { id: orderId, paymentStatus: "UNPAID" }, data: { paymentStatus } })
    if (count === 0) return false
    const items = await tx.orderItem.findMany({ where: { orderId, status: "PENDING" } })
    await tx.orderItem.updateMany({ where: { orderId, status: "PENDING" }, data: { status: "CANCELLED" } })
    await releaseStock(tx, items)
    return true
})

const markPaid = (order, paymentType) => prisma.$transaction(async (tx) => {
    const paid = { paymentStatus: "PAID", paymentType: paymentType ?? null, paidAt: new Date() }
    const { count } = await tx.order.updateMany({ where: { id: order.id, paymentStatus: "UNPAID" }, data: paid })
    if (count) return "PAID"
    // dibayar setelah pesanan sempat ditutup (kedaluwarsa / dibatalkan): item sudah batal dan stok sudah kembali,
    // jadi seluruh pembayaran dikembalikan (refund untuk admin)
    const late = await tx.order.updateMany({ where: { id: order.id, paymentStatus: { in: ["EXPIRED", "FAILED", "CANCELLED"] } }, data: paid })
    if (late.count) {
        return tx.refund.upsert({
            where: { key: `late:${order.id}` },
            create: {
                key: `late:${order.id}`,
                orderId: order.id,
                amount: order.total,
                reason: "LATE_PAYMENT",
                description: `Pembayaran masuk setelah pesanan ${order.paymentStatus === "CANCELLED" ? "dibatalkan" : "kedaluwarsa"}`,
            },
            update: {},
        })
    }
    return null
}).then((result) => {
    if (result === "PAID") background(events.orderPaid(order.id))
    else if (result) background(events.refundCreated(result))
})

// Pesanan belum dibayar ditutup sistem (kedaluwarsa / ditolak) -> pembeli diberi tahu
const closeAndNotify = async (orderId, status) => {
    if (await closeUnpaidOrder(orderId, status)) background(events.orderClosed(orderId, status))
}

// Terapkan data transaksi Midtrans (dari notifikasi atau cek status) ke pesanan
export const applyTransaction = async (order, transaction) => {
    if (Math.round(Number(transaction.gross_amount)) !== order.total) {
        console.warn(`Nominal Midtrans ${transaction.gross_amount} tidak sama dengan total pesanan ${order.id}.`)
        return
    }
    const status = toPaymentStatus(transaction)
    if (status === "PAID") await markPaid(order, transaction.payment_type)
    else if (status) await closeAndNotify(order.id, status)
}

const isOverdue = (order) => order.paymentExpiresAt && Date.now() > order.paymentExpiresAt.getTime() + GRACE_MS

// Tanya Midtrans langsung (berguna di localhost, di mana webhook tidak bisa masuk)
export const refreshPayment = async (order) => {
    if (order.paymentStatus !== "UNPAID") return
    if (!order.paymentRef || !midtransEnabled) {
        if (isOverdue(order)) await closeAndNotify(order.id, "EXPIRED")
        return
    }
    const transaction = await getTransactionStatus(order.paymentRef)
    if (transaction) await applyTransaction(order, transaction)
    else if (isOverdue(order)) await closeAndNotify(order.id, "EXPIRED") // tidak pernah memilih metode bayar
}

// Tutup pesanan yang lewat batas bayar (dipanggil sebelum menampilkan daftar pesanan).
// Gagal menghubungi Midtrans tidak menggagalkan halaman; dicoba lagi lain kali.
export const expireOverdueOrders = async (where = {}) => {
    const overdue = await prisma.order.findMany({
        where: { ...where, paymentStatus: "UNPAID", paymentExpiresAt: { lt: new Date(Date.now() - GRACE_MS) } },
        take: 20,
    })
    for (const order of overdue) {
        await refreshPayment(order).catch((error) => console.error(`Cek pembayaran pesanan ${order.id} gagal:`, error.message))
    }
}
