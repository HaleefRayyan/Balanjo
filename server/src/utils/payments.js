// Perubahan status pembayaran pesanan. Dipakai oleh webhook Midtrans, cek status manual, dan kedaluwarsa.
// Semua update bersyarat (updateMany ... where status lama), jadi notifikasi ganda / bersamaan aman.
import { prisma } from "../db.js"
import { getTransactionStatus, midtransEnabled, toPaymentStatus } from "./midtrans.js"

const GRACE_MS = 60_000 // jeda setelah batas bayar sebelum dianggap kedaluwarsa (jam server vs Midtrans)

// Pesanan belum dibayar -> EXPIRED / FAILED / CANCELLED: semua item dibatalkan dan stok dikembalikan
export const closeUnpaidOrder = (orderId, paymentStatus) => prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({ where: { id: orderId, paymentStatus: "UNPAID" }, data: { paymentStatus } })
    if (count === 0) return false
    const items = await tx.orderItem.findMany({ where: { orderId, status: "PENDING" } })
    await tx.orderItem.updateMany({ where: { orderId, status: "PENDING" }, data: { status: "CANCELLED" } })
    for (const item of items.filter((line) => line.productId)) {
        await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
    }
    return true
})

const markPaid = async (order, paymentType) => {
    const { count } = await prisma.order.updateMany({
        where: { id: order.id, paymentStatus: { not: "PAID" } },
        data: { paymentStatus: "PAID", paymentType: paymentType ?? null, paidAt: new Date() },
    })
    // dibayar setelah pesanan sempat ditutup (sangat jarang): item sudah batal, uang perlu dikembalikan
    if (count && order.paymentStatus !== "UNPAID") {
        console.warn(`Pesanan ${order.id} dibayar setelah berstatus ${order.paymentStatus}: perlu refund.`)
    }
}

// Terapkan data transaksi Midtrans (dari notifikasi atau cek status) ke pesanan
export const applyTransaction = async (order, transaction) => {
    if (Math.round(Number(transaction.gross_amount)) !== order.total) {
        console.warn(`Nominal Midtrans ${transaction.gross_amount} tidak sama dengan total pesanan ${order.id}.`)
        return
    }
    const status = toPaymentStatus(transaction)
    if (status === "PAID") await markPaid(order, transaction.payment_type)
    else if (status) await closeUnpaidOrder(order.id, status)
}

const isOverdue = (order) => order.paymentExpiresAt && Date.now() > order.paymentExpiresAt.getTime() + GRACE_MS

// Tanya Midtrans langsung (berguna di localhost, di mana webhook tidak bisa masuk)
export const refreshPayment = async (order) => {
    if (order.paymentStatus !== "UNPAID") return
    if (!order.paymentRef || !midtransEnabled) {
        if (isOverdue(order)) await closeUnpaidOrder(order.id, "EXPIRED")
        return
    }
    const transaction = await getTransactionStatus(order.paymentRef)
    if (transaction) await applyTransaction(order, transaction)
    else if (isOverdue(order)) await closeUnpaidOrder(order.id, "EXPIRED") // tidak pernah memilih metode bayar
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
