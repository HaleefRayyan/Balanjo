// Isi notifikasi untuk tiap kejadian di toko (pembeli, seller, admin). Dipanggil setelah datanya tersimpan.
import { prisma } from "../db.js"
import { notify, notifyAdmins } from "./notify.js"

const rupiah = (amount) => `Rp${amount.toLocaleString("id-ID")}`
const code = (id) => `#${String(id).padStart(6, "0")}`
const itemLabel = (item) => `${item.name}${item.variant ? ` (${item.variant})` : ""} × ${item.quantity}`

const loadOrder = (orderId) => prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { orderBy: { id: "asc" } }, user: { select: { name: true } } },
})

// Pesanan dibayar (atau dibuat, tanpa pembayaran online): pembeli + tiap seller di pesanan
export const orderPaid = async (orderId) => {
    const order = await loadOrder(orderId)
    if (!order) return
    const online = Boolean(order.paymentRef)
    const bySeller = Map.groupBy(order.items.filter((item) => item.sellerId), (item) => item.sellerId)
    await Promise.all([notify(order.userId, {
        type: "ORDER_PAID",
        title: online ? `Pembayaran pesanan ${code(order.id)} diterima` : `Pesanan ${code(order.id)} dibuat`,
        body: `Total ${rupiah(order.total)}. Pesananmu sudah diteruskan ke seller.`,
        email: order.items.map(itemLabel),
        link: "/profile/orders",
        linkLabel: "Lihat pesanan",
    }), ...[...bySeller].map(([sellerId, items]) => notify(sellerId, {
        type: "NEW_ORDER",
        title: `Pesanan baru ${code(order.id)}`,
        body: `${order.user.name} memesan ${items.map(itemLabel).join(", ")}. Segera proses pesanannya.`,
        email: [
            order.deliveryMethod === "DELIVERY" ? `Antar ke: ${order.address}` : "Diambil pembeli di kampus.",
            `Kontak pembeli: ${order.recipientName}, ${order.phone}`,
            ...(order.note ? [`Catatan: ${order.note}`] : []),
        ],
        link: "/seller/orders",
        linkLabel: "Proses pesanan",
    }))])
}

// Belum dibayar sampai batas waktu / pembayaran ditolak (dibatalkan pembeli sendiri: tidak perlu notifikasi)
export const orderClosed = async (orderId, status) => {
    if (status !== "EXPIRED" && status !== "FAILED") return
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return
    await notify(order.userId, {
        type: status === "EXPIRED" ? "ORDER_EXPIRED" : "PAYMENT_FAILED",
        title: status === "EXPIRED" ? `Pesanan ${code(order.id)} kedaluwarsa` : `Pembayaran pesanan ${code(order.id)} gagal`,
        body: "Pesanan dibatalkan otomatis. Kamu bisa memesan lagi dari Riwayat Pesanan.",
        link: "/profile/orders",
        linkLabel: "Pesan lagi",
    })
}

const statusMessages = {
    PROCESSING: (item) => ({ title: "Pesanan sedang diproses", body: `${itemLabel(item)} sedang disiapkan seller.` }),
    SHIPPED: (item, order) => ({
        title: order.deliveryMethod === "DELIVERY" ? "Pesanan sedang diantar" : "Pesanan siap diambil",
        body: order.deliveryMethod === "DELIVERY" ? `${itemLabel(item)} sedang diantar ke ${order.address}.` : `${itemLabel(item)} siap diambil. Seller akan menghubungi ${order.phone}.`,
    }),
    DONE: (item) => ({ title: "Pesanan selesai", body: `${itemLabel(item)} sudah selesai. Yuk beri ulasan untuk produk ini!` }),
    CANCELLED: (item, order, refund) => ({
        title: "Item dibatalkan seller",
        body: `${itemLabel(item)} dibatalkan seller.${refund ? ` Dana ${rupiah(refund.amount)} akan dikembalikan oleh admin.` : ""}`,
    }),
}

// Seller mengubah status item -> pembeli; kalau ada refund -> admin
export const itemStatusChanged = async (itemId, status, refund) => {
    const item = await prisma.orderItem.findUnique({ where: { id: itemId }, include: { order: true } })
    if (!item || !statusMessages[status]) return
    const { title, body } = statusMessages[status](item, item.order, refund)
    await notify(item.order.userId, {
        type: "ITEM_STATUS",
        title: `${title} (${code(item.orderId)})`,
        body,
        link: "/profile/orders",
        linkLabel: status === "DONE" ? "Beri ulasan" : "Lihat pesanan",
    })
    if (refund) await refundCreated(refund)
}

export const refundCreated = (refund) => notifyAdmins({
    type: "REFUND_PENDING",
    title: `Refund ${rupiah(refund.amount)} perlu diproses`,
    body: `Pesanan ${code(refund.orderId)}: ${refund.description}.`,
    link: "/admin/orders/refunds",
    linkLabel: "Proses refund",
})

export const refundDone = async (refund) => {
    const order = await prisma.order.findUnique({ where: { id: refund.orderId } })
    if (!order) return
    await notify(order.userId, {
        type: "REFUND_DONE",
        title: `Dana ${rupiah(refund.amount)} sudah dikembalikan`,
        body: `Refund untuk pesanan ${code(order.id)}: ${refund.description}.`,
        email: refund.adminNote ? [`Catatan admin: ${refund.adminNote}`] : [],
        link: "/profile/orders",
    })
}

export const reviewCreated = async (review) => {
    const product = await prisma.product.findUnique({ where: { id: review.productId }, select: { id: true, name: true, sellerId: true } })
    if (!product) return
    await notify(product.sellerId, {
        type: "NEW_REVIEW",
        title: `Ulasan baru ${"★".repeat(review.rating)} untuk ${product.name}`,
        body: review.comment ? `"${review.comment.slice(0, 200)}"` : `${review.rating} dari 5 bintang.`,
        link: `/e-commerce/product/${product.id}`,
        linkLabel: "Lihat ulasan",
    })
}

export const payoutRequested = (payout, sellerName) => notifyAdmins({
    type: "PAYOUT_PENDING",
    title: `Pengajuan payout ${rupiah(payout.amount)}`,
    body: `${sellerName} meminta penarikan ke ${payout.method} ${payout.accountNumber} a.n. ${payout.accountName}.`,
    link: "/admin/payouts",
    linkLabel: "Proses payout",
})

export const payoutProcessed = (payout) => notify(payout.sellerId, {
    type: payout.status === "PAID" ? "PAYOUT_PAID" : "PAYOUT_REJECTED",
    title: payout.status === "PAID" ? `Payout ${rupiah(payout.amount)} sudah ditransfer` : `Payout ${rupiah(payout.amount)} ditolak`,
    body: payout.status === "PAID"
        ? `Dana dikirim ke ${payout.method} ${payout.accountNumber}.`
        : `Alasan: ${payout.adminNote}. Saldo sudah dikembalikan, kamu bisa mengajukan lagi.`,
    email: payout.status === "PAID" && payout.adminNote ? [`Catatan admin: ${payout.adminNote}`] : [],
    link: "/seller/earnings",
    linkLabel: "Lihat penghasilan",
})
