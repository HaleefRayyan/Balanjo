// Harus sama dengan daftar kategori di frontend (src/constants/categories.js)
export const BLOG_CATEGORIES = ["Technology", "Bisnis", "Pelajaran", "Food"]
export const FORUM_CATEGORIES = ["Campus Life", "Tech", "Kesehatan", "Informasi", "Bisnis", "Random"]
export const PRODUCT_CATEGORIES = ["Makanan", "Minuman", "Fashion", "Creative", "Listrik", "Pulsa", "Jasa", "Obat-obatan"]

export const ROLES = { USER: "USER", ADMIN: "ADMIN" }
export const BANNER_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"]

// Status per item pesanan, berurutan. CANCELLED hanya boleh dari PENDING/PROCESSING.
export const ORDER_ITEM_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DONE", "CANCELLED"]

// Pengiriman saat checkout (harus sama dengan src/constants/shop.js di frontend)
export const DELIVERY_METHODS = ["PICKUP", "DELIVERY"] // ambil di kampus | antar di area kampus
export const DELIVERY_FEE_PER_SELLER = 5000 // ongkos antar per seller dalam satu pesanan

// Pembayaran (Midtrans). UNPAID -> PAID, atau berakhir EXPIRED / FAILED / CANCELLED (item dibatalkan, stok kembali)
export const PAYMENT_EXPIRY_MINUTES = 60

// Payout seller (harus sama dengan src/constants/shop.js di frontend)
export const PAYOUT_METHODS = ["BCA", "BRI", "BNI", "Mandiri", "BSI", "CIMB Niaga", "Permata", "SeaBank", "Bank Jago", "GoPay", "OVO", "DANA", "ShopeePay"]
export const PAYOUT_MIN_AMOUNT = 10000
export const PAYOUT_STATUSES = ["PENDING", "PAID", "REJECTED"]
