// Harus sama dengan server/src/constants.js
export const DELIVERY_FEE_PER_SELLER = 5000

export const deliveryOptions = [
    { value: "PICKUP", label: "Ambil di kampus", description: "Ambil langsung dari seller. Gratis." },
    { value: "DELIVERY", label: "Antar di area kampus", description: "Seller mengantar ke titik temu. Ongkos per seller." },
]

export const deliveryLabel = (method) => deliveryOptions.find((option) => option.value === method)?.label ?? method

// Payout seller
export const PAYOUT_METHODS = ["BCA", "BRI", "BNI", "Mandiri", "BSI", "CIMB Niaga", "Permata", "SeaBank", "Bank Jago", "GoPay", "OVO", "DANA", "ShopeePay"]

export const payoutStatus = {
    PENDING: { label: "Diproses", className: "bg-amber-100 text-amber-800" },
    PAID: { label: "Dibayar", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
}

export const refundStatus = {
    PENDING: { label: "Refund diproses", className: "bg-amber-100 text-amber-800" },
    REFUNDED: { label: "Dana dikembalikan", className: "bg-green-100 text-green-800" },
}
