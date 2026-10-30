// Status item pesanan (harus sama dengan server/src/constants.js)
export const orderStatus = {
    PENDING: { label: "Menunggu konfirmasi", className: "bg-amber-100 text-amber-800" },
    PROCESSING: { label: "Diproses", className: "bg-blue-100 text-blue-800" },
    SHIPPED: { label: "Pengiriman", className: "bg-indigo-100 text-indigo-800" },
    DONE: { label: "Selesai", className: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Dibatalkan", className: "bg-gray-200 text-gray-600" },
}

const FLOW = ["PENDING", "PROCESSING", "SHIPPED", "DONE"]

// Pilihan status yang boleh dipilih seller dari status sekarang (sama dengan aturan server):
// hanya maju, batal hanya sebelum dikirim, Selesai/Dibatalkan sudah final.
export const nextStatuses = (current) => {
    if (current === "DONE" || current === "CANCELLED") return []
    const ahead = FLOW.slice(FLOW.indexOf(current) + 1)
    return current === "SHIPPED" ? ahead : [...ahead, "CANCELLED"]
}

export const bannerRequestStatus = {
    PENDING: { label: "Menunggu review", className: "bg-amber-100 text-amber-800" },
    APPROVED: { label: "Disetujui", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
}
