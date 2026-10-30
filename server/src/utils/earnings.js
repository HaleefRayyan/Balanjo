// Penghasilan & saldo seller. Hanya pesanan yang dibayar online (uang ada di Balanjo) yang dihitung.
//   bersih per item  = harga × jumlah - potongan platform
//   ongkos antar     = utuh untuk seller (dia yang mengantar), sekali per pesanan
//   tersedia         = item Selesai (+ ongkos antar pesanan yang punya item Selesai)
//   tertahan         = item yang dibayar tapi belum Selesai
//   saldo            = tersedia - payout yang sudah dibayar / sedang diajukan
import { prisma } from "../db.js"
import { DELIVERY_FEE_PER_SELLER } from "../constants.js"

const ACTIVE = ["PENDING", "PROCESSING", "SHIPPED"]

export const sellerEarnings = async (sellerId) => {
    const [items, payouts] = await Promise.all([
        prisma.orderItem.findMany({
            where: { sellerId, order: { paymentStatus: "PAID", paymentRef: { not: null } } },
            select: {
                id: true, orderId: true, name: true, variant: true, price: true, quantity: true, platformFee: true, status: true,
                order: { select: { deliveryMethod: true, paidAt: true } },
            },
            orderBy: [{ orderId: "desc" }, { id: "asc" }],
        }),
        prisma.payout.groupBy({ by: ["status"], where: { sellerId }, _sum: { amount: true } }),
    ])

    const entries = []
    let available = 0
    let pending = 0
    let fees = 0
    const byOrder = Map.groupBy(items, (item) => item.orderId)
    for (const [orderId, orderItems] of byOrder) {
        for (const item of orderItems) {
            const gross = item.price * item.quantity
            const net = gross - item.platformFee
            if (item.status === "DONE") { available += net; fees += item.platformFee }
            else if (ACTIVE.includes(item.status)) pending += net
            entries.push({
                orderId, paidAt: item.order.paidAt, name: item.name, variant: item.variant, quantity: item.quantity,
                gross, fee: item.platformFee, net, status: item.status,
            })
        }
        const order = orderItems[0].order
        if (order.deliveryMethod === "DELIVERY" && orderItems.some((item) => item.status !== "CANCELLED")) {
            const done = orderItems.some((item) => item.status === "DONE")
            if (done) available += DELIVERY_FEE_PER_SELLER
            else pending += DELIVERY_FEE_PER_SELLER
            entries.push({
                orderId, paidAt: order.paidAt, name: "Ongkos antar", variant: null, quantity: 1,
                gross: DELIVERY_FEE_PER_SELLER, fee: 0, net: DELIVERY_FEE_PER_SELLER, status: done ? "DONE" : "PROCESSING",
            })
        }
    }

    const payoutSum = (status) => payouts.find((row) => row.status === status)?._sum.amount ?? 0
    const withdrawn = payoutSum("PAID")
    const requested = payoutSum("PENDING")
    return {
        summary: {
            balance: available - withdrawn - requested, // bisa ditarik sekarang
            pending, // menunggu pesanan selesai
            requested, // pengajuan yang sedang diproses admin
            withdrawn,
            earned: available,
            fees,
        },
        entries,
    }
}
