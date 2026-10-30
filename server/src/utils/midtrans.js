// Midtrans Snap (https://docs.midtrans.com). Kunci hanya ada di server (server/.env / Vercel).
import crypto from "node:crypto"
import { config } from "../config.js"

const { serverKey, isProduction } = config.midtrans
const SNAP_URL = isProduction ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions"
const API_URL = isProduction ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2"

export const midtransEnabled = Boolean(serverKey)

const headers = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
})

const request = async (url, init = {}) => {
    const response = await fetch(url, { ...init, headers: headers(), signal: AbortSignal.timeout(15_000) })
    const data = await response.json().catch(() => ({}))
    return { status: response.status, data }
}

// Waktu mulai kedaluwarsa dalam format Midtrans: "2026-10-30 10:12:00 +0700"
const midtransTime = (date) => `${new Date(date.getTime() + 7 * 3600_000).toISOString().slice(0, 19).replace("T", " ")} +0700`

// Membuat transaksi Snap. Jumlah item_details harus sama persis dengan gross_amount.
export const createSnapTransaction = async ({ ref, order, user, expiryMinutes, finishUrl }) => {
    const itemDetails = order.items.map((item) => ({
        id: String(item.productId ?? item.id),
        price: item.price,
        quantity: item.quantity,
        name: `${item.name}${item.variant ? ` (${item.variant})` : ""}`.slice(0, 50),
    }))
    if (order.shippingFee > 0) itemDetails.push({ id: "ONGKIR", price: order.shippingFee, quantity: 1, name: "Ongkos antar" })

    const { status, data } = await request(SNAP_URL, {
        method: "POST",
        body: JSON.stringify({
            transaction_details: { order_id: ref, gross_amount: order.total },
            item_details: itemDetails,
            customer_details: { first_name: order.recipientName.slice(0, 50), email: user.email, phone: order.phone },
            expiry: { start_time: midtransTime(order.createdAt), unit: "minutes", duration: expiryMinutes },
            callbacks: { finish: finishUrl },
        }),
    })
    if (status !== 201 || !data.token) {
        console.error("Midtrans Snap gagal:", status, data.error_messages ?? data)
        return null
    }
    return { token: data.token, redirectUrl: data.redirect_url }
}

// Status transaksi dari Midtrans. null = transaksi belum ada (pembeli belum memilih metode bayar).
export const getTransactionStatus = async (ref) => {
    const { data } = await request(`${API_URL}/${encodeURIComponent(ref)}/status`)
    if (String(data.status_code) === "404") return null
    if (!data.transaction_status) throw new Error(`Status Midtrans tidak terbaca (${data.status_code})`)
    return data
}

// Batalkan transaksi yang belum dibayar (best effort: transaksi yang belum ada akan 404)
export const cancelTransaction = (ref) => request(`${API_URL}/${encodeURIComponent(ref)}/cancel`, { method: "POST" }).catch(() => null)

// Notifikasi asli dari Midtrans: SHA512(order_id + status_code + gross_amount + server key)
export const verifySignature = (notification) => {
    const { order_id: ref, status_code: statusCode, gross_amount: grossAmount, signature_key: signature } = notification
    if (![ref, statusCode, grossAmount, signature].every((value) => typeof value === "string")) return false
    const expected = crypto.createHash("sha512").update(ref + statusCode + grossAmount + serverKey).digest("hex")
    return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

// transaction_status Midtrans -> paymentStatus pesanan (null = masih menunggu)
export const toPaymentStatus = ({ transaction_status: status, fraud_status: fraud }) => {
    if (status === "settlement") return "PAID"
    if (status === "capture") return fraud === "accept" || !fraud ? "PAID" : null // "challenge": tunggu keputusan
    if (status === "expire") return "EXPIRED"
    if (["deny", "cancel", "failure"].includes(status)) return "FAILED"
    return null // pending, authorize, dll.
}
