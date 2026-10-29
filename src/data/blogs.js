import cover from "../assets/blog/blog.png"
import image from "../assets/blog/image.png"
import profile from "../assets/blog/profile.png"

export const blogCategories = ["Technology", "Bisnis", "Pelajaran", "Food"]

// Artikel contoh belum punya `body`; halaman detail menampilkan artikel sampel untuk mereka.
const blogs = [
    {
        id: 1,
        slug: "the-impact-of-technology-on-the-workplace",
        title: "The Impact of Technology on the Workplace: How Technology is Changing",
        category: "Technology",
        author: "Elizabeth Slavin",
        date: "August 20, 2022",
        publishedAt: "20 Aug 2022, 8:00pm",
    },
    {
        id: 2,
        slug: "the-scalability-solution-layer-one-vs-layer-two-blockchains",
        title: "The Scalability Solution: Understanding Layer One vs. Layer Two Blockchains",
        category: "Technology",
        author: "Elizabeth Slavin",
        date: "January 20, 2024",
        publishedAt: "20 Jan 2024, 8:00pm",
    },
    {
        id: 3,
        slug: "tips-memulai-usaha-kecil-saat-masih-kuliah",
        title: "Tips Memulai Usaha Kecil Saat Masih Kuliah",
        category: "Bisnis",
        author: "budi geming",
        date: "July 6, 2024",
        publishedAt: "6 Jul 2024, 9:15am",
    },
    {
        id: 4,
        slug: "6-trik-absen-kencang-tanpa-telat",
        title: "6 Trik Absen Kencang Tanpa Telat",
        category: "Pelajaran",
        author: "maemunah",
        date: "July 6, 2024",
        publishedAt: "6 Jul 2024, 7:30am",
    },
    {
        id: 5,
        slug: "rekomendasi-kuliner-murah-di-sekitar-kampus",
        title: "Rekomendasi Kuliner Murah di Sekitar Kampus",
        category: "Food",
        author: "munaroh",
        date: "July 6, 2024",
        publishedAt: "6 Jul 2024, 12:00pm",
    },
    {
        id: 6,
        slug: "cara-mengatur-waktu-antara-kuliah-dan-organisasi",
        title: "Cara Mengatur Waktu antara Kuliah dan Organisasi",
        category: "Pelajaran",
        author: "maemunah",
        date: "July 5, 2024",
        publishedAt: "5 Jul 2024, 4:45pm",
    },
].map((blog) => ({ cover, image, authorPhoto: profile, ...blog }))

export const defaultBlogCover = cover
export const defaultAuthorPhoto = profile

export default blogs
