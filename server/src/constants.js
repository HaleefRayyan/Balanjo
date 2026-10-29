// Harus sama dengan daftar kategori di frontend (src/constants/categories.js)
export const BLOG_CATEGORIES = ["Technology", "Bisnis", "Pelajaran", "Food"]
export const FORUM_CATEGORIES = ["Campus Life", "Tech", "Kesehatan", "Informasi", "Bisnis", "Random"]
export const PRODUCT_CATEGORIES = ["Makanan", "Minuman", "Fashion", "Creative", "Listrik", "Pulsa", "Jasa", "Obat-obatan"]

export const ROLES = { USER: "USER", ADMIN: "ADMIN" }
export const BANNER_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"]

// Status per item pesanan, berurutan. CANCELLED hanya boleh dari PENDING/PROCESSING.
export const ORDER_ITEM_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DONE", "CANCELLED"]
