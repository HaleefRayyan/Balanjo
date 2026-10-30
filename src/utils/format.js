// 59000 -> "Rp59.000"
export const formatRupiah = (amount) => `Rp${amount.toLocaleString("id-ID")}`

// "Judul Artikel Baru!" -> "judul-artikel-baru"
export const slugify = (text) =>
    text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

// 06/07/2024 (dipakai forum & tabel admin)
export const formatShortDate = (date = new Date()) => date.toLocaleDateString("en-GB")

// August 20, 2022 (kartu blog)
export const formatLongDate = (date = new Date()) =>
    date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

// 20 Jan 2024, 8:00pm (detail blog)
export const formatDateTime = (date = new Date()) => {
    const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(" ", "").toLowerCase()
    return `${day}, ${time}`
}

// 12 -> "#000012" (kode pesanan / produk seperti di desain)
export const formatCode = (id) => `#${String(id).padStart(6, "0")}`
