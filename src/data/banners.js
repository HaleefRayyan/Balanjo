import banner from "../assets/started/banner.png"
import bannerDua from "../assets/started/bannerDua.png"
import bannerTiga from "../assets/started/bannerTiga.png"
import iklan from "../assets/ECommerce/iklan.png"
import iklanDua from "../assets/ECommerce/iklanDua.png"

// Banner yang tampil di halaman E-Commerce / Get Started
export const banners = [
    { id: "Banner 1", image: banner },
    { id: "Banner 2", image: bannerDua },
    { id: "Banner 3", image: bannerTiga },
]

// Banner yang diajukan seller, menunggu persetujuan admin ("" = belum diproses)
export const bannerRequests = [
    { id: 1, productId: 1, product: "Kacamata Korea Hitam", seller: "Anto", date: "06/07/2024", status: "", image: iklan },
    { id: 2, productId: 3, product: "Kacamata Korea Hitam", seller: "Budi", date: "05/07/2024", status: "Disetujui", image: iklanDua },
    { id: 3, productId: 5, product: "Kacamata Korea Hitam", seller: "Munaroh", date: "03/07/2024", status: "Ditolak", image: iklan },
]

export const bannerStatuses = ["Disetujui", "Ditolak"]
