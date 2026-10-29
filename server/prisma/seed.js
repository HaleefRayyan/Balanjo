// Mengisi database dengan data contoh (dijalankan oleh `npm run db:reset` / `npm run setup`).
// Gambar disalin dari aset frontend ke server/uploads, satu file per record.
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const here = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(here, "..", "..", "src", "assets")
const uploadDir = path.resolve(here, "..", "uploads")

let counter = 0
const copyAsset = async (relative) => {
    const name = `seed-${++counter}${path.extname(relative)}`
    await fs.copyFile(path.join(assetsDir, relative), path.join(uploadDir, name))
    return `/uploads/${name}`
}

const daysAgo = (days, hour = 9) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    date.setHours(hour, 0, 0, 0)
    return date
}

const paragraphs = (...items) => items.map((text) => `<p>${text}</p>`).join("\n")

const main = async () => {
    // kosongkan folder uploads (kecuali .gitkeep) supaya tidak menumpuk file lama
    await fs.mkdir(uploadDir, { recursive: true })
    for (const file of await fs.readdir(uploadDir)) {
        if (file !== ".gitkeep") await fs.unlink(path.join(uploadDir, file))
    }

    const hash = (password) => bcrypt.hash(password, 10)
    const userPassword = await hash("password123")

    const users = {}
    for (const [key, data] of Object.entries({
        admin: { name: "Admin Balanjo", username: "admin", email: "admin@balanjo.com", role: "ADMIN" },
        budi: { name: "Budianto", username: "budigeming", email: "budi@gmail.com" },
        wawan: { name: "Wawan Suprawan", username: "wawanzz", email: "wawan@gmail.com" },
        maemunah: { name: "Maemunah", username: "maemunah", email: "maemunah@gmail.com" },
        munaroh: { name: "Munaroh", username: "munaroh", email: "munaroh@gmail.com" },
        anto: { name: "Anto", username: "anto", email: "anto@gmail.com" },
        mrc1na: { name: "mrc1na", username: "mrc1na", email: "mrc1na@gmail.com" },
        elizabeth: { name: "Elizabeth Slavin", username: "elizabeth", email: "elizabeth@gmail.com" },
    })) {
        const passwordHash = key === "admin" ? await hash("admin12345") : userPassword
        users[key] = await prisma.user.create({ data: { ...data, passwordHash, createdAt: daysAgo(30) } })
    }

    // ---------- Blog ----------
    const sampleArticle = await fs.readFile(path.join(here, "sample-article.html"), "utf8")
    const blogs = [
        {
            slug: "the-impact-of-technology-on-the-workplace",
            title: "The Impact of Technology on the Workplace: How Technology is Changing",
            category: "Technology", author: "elizabeth", days: 20,
            body: paragraphs(
                "Teknologi mengubah cara kita bekerja: rapat berpindah ke panggilan video, dokumen dikerjakan bersama secara real-time, dan banyak pekerjaan rutin kini dibantu otomatisasi.",
                "Bagi mahasiswa, ini berarti keterampilan digital seperti kolaborasi daring, manajemen proyek, dan literasi data menjadi bekal penting sebelum masuk dunia kerja.",
            ),
        },
        { slug: "the-scalability-solution-layer-one-vs-layer-two-blockchains", title: "The Scalability Solution: Understanding Layer One vs. Layer Two Blockchains", category: "Technology", author: "elizabeth", days: 15, body: sampleArticle, image: "blog/image.png" },
        {
            slug: "tips-memulai-usaha-kecil-saat-masih-kuliah",
            title: "Tips Memulai Usaha Kecil Saat Masih Kuliah",
            category: "Bisnis", author: "budi", days: 6,
            body: "<h2>Mulai dari yang kecil</h2>" + paragraphs(
                "Pilih produk yang dekat dengan kebutuhan teman-teman kampus, misalnya makanan ringan, jasa desain, atau perlengkapan kuliah.",
                "Catat modal dan penjualan sejak hari pertama. Kebiasaan ini memudahkan kamu melihat produk mana yang paling laku.",
            ) + "<ul><li>Manfaatkan media sosial dan grup angkatan</li><li>Minta testimoni dari pembeli pertama</li><li>Jual di E-Commerce Balanjo</li></ul>",
        },
        {
            slug: "6-trik-absen-kencang-tanpa-telat",
            title: "6 Trik Absen Kencang Tanpa Telat",
            category: "Pelajaran", author: "maemunah", days: 5,
            body: "<ol><li>Siapkan baju dan tas sejak malam</li><li>Pasang dua alarm</li><li>Cek jadwal kuliah sebelum tidur</li><li>Sarapan yang praktis</li><li>Berangkat 15 menit lebih awal</li><li>Duduk di barisan depan supaya tetap fokus</li></ol>",
        },
        {
            slug: "rekomendasi-kuliner-murah-di-sekitar-kampus",
            title: "Rekomendasi Kuliner Murah di Sekitar Kampus",
            category: "Food", author: "munaroh", days: 4,
            body: paragraphs(
                "Makan enak tidak harus mahal. Di sekitar kampus ada banyak warung dengan menu lengkap mulai dari Rp10.000.",
                "Coba juga produk makanan dari UMKM mahasiswa di halaman E-Commerce Balanjo, sekalian mendukung usaha teman sendiri.",
            ),
        },
        {
            slug: "cara-mengatur-waktu-antara-kuliah-dan-organisasi",
            title: "Cara Mengatur Waktu antara Kuliah dan Organisasi",
            category: "Pelajaran", author: "maemunah", days: 2,
            body: paragraphs(
                "Buat satu kalender untuk jadwal kuliah, rapat organisasi, dan tenggat tugas supaya tidak ada yang bentrok.",
                "Belajar berkata tidak pada kegiatan yang tidak sesuai prioritasmu semester ini.",
            ) + "<blockquote>Organisasi melatih soft skill, kuliah membangun fondasi. Keduanya bisa jalan bareng.</blockquote>",
        },
    ]
    for (const blog of blogs) {
        await prisma.blog.create({
            data: {
                slug: blog.slug, title: blog.title, category: blog.category, body: blog.body,
                coverUrl: await copyAsset(blog.image ?? "blog/blog.png"),
                authorId: users[blog.author].id, createdAt: daysAgo(blog.days),
            },
        })
    }

    // ---------- Forum ----------
    const replyPool = [
        ["budi", "Setuju banget, aku juga pernah ngalamin."],
        ["maemunah", "Coba tanya ke grup angkatan, biasanya ada info."],
        ["wawan", "Mantap, makasih infonya!"],
        ["munaroh", "Aku rekomen tempat dekat gerbang belakang, murah dan nyaman."],
        ["anto", "Ikut nyimak ya."],
    ]
    const posts = [
        { author: "mrc1na", text: "Do you like pigeons ?", category: "Random", days: 6, replies: 2 },
        { author: "mrc1na", text: "Info tempat nongkrong di Unand dong", category: "Campus Life", days: 7, replies: 14, image: "forum/image.png" },
        { author: "mrc1na", text: "Ig Error ya?", category: "Tech", days: 9, replies: 0 },
        { author: "wawan", text: "Guyss, ada info jadwal wisuda ga?", category: "Informasi", days: 10, replies: 12 },
        { author: "maemunah", text: "Rekomen beli hadiah buat sempro", category: "Campus Life", days: 11, replies: 10 },
        { author: "budi", text: "Tips n trik war KRS", category: "Campus Life", days: 12, replies: 8 },
    ]
    for (const post of posts) {
        await prisma.forumPost.create({
            data: {
                text: post.text, category: post.category, authorId: users[post.author].id, createdAt: daysAgo(post.days),
                imageUrl: post.image ? await copyAsset(post.image) : null,
                comments: {
                    create: Array.from({ length: post.replies }, (_, index) => {
                        const [author, text] = replyPool[index % replyPool.length]
                        return { text, authorId: users[author].id, createdAt: daysAgo(post.days, 10 + (index % 12)) }
                    }),
                },
            },
        })
    }

    // ---------- Produk ----------
    const templates = [
        { name: "Kacamata Korea Hitam", category: "Fashion", price: 59000, photo: "ECommerce/kacamata.png", variants: ["Hitam", "Coklat", "Transparan"], description: "Kacamata ini dapat melindungi mata kita dari berbagai jenis radiasi. Mulai dari radiasi sinar ultraviolet sampai radiasi nuklir. Selain itu, kacamata ini juga memiliki bentuk yang keren dan kece." },
        { name: "Lilin Aromaterapi Varian Anggur", category: "Creative", price: 45000, photo: "ECommerce/lilin.png", variants: ["Anggur", "Lavender", "Vanila"], description: "Lilin aromaterapi dengan wangi yang menenangkan, cocok untuk menemani belajar dan beristirahat." },
    ]
    const sellers = ["anto", "budi", "munaroh"]
    const products = []
    for (let index = 0; index < 12; index++) {
        const template = templates[index % templates.length]
        products.push(await prisma.product.create({
            data: {
                name: template.name, category: template.category, price: template.price, description: template.description,
                variants: JSON.stringify(template.variants), photoUrl: await copyAsset(template.photo), stock: 20,
                sellerId: users[sellers[index % sellers.length]].id,
            },
        }))
    }

    // ---------- Banner ----------
    for (const [index, image] of ["started/banner.png", "started/bannerDua.png", "started/bannerTiga.png"].entries()) {
        await prisma.banner.create({ data: { label: `Banner ${index + 1}`, imageUrl: await copyAsset(image), position: index } })
    }
    const requests = [
        { product: 0, seller: "anto", status: "PENDING", days: 1, image: "ECommerce/iklan.png" },
        { product: 1, seller: "budi", status: "REJECTED", days: 2, image: "ECommerce/iklanDua.png" },
        { product: 2, seller: "munaroh", status: "PENDING", days: 4, image: "ECommerce/iklan.png" },
    ]
    for (const request of requests) {
        await prisma.bannerRequest.create({
            data: {
                productId: products[request.product].id, sellerId: users[request.seller].id, status: request.status,
                imageUrl: await copyAsset(request.image), createdAt: daysAgo(request.days),
            },
        })
    }

    console.log("Seed selesai. Login admin: admin@balanjo.com / admin12345 · user: budi@gmail.com / password123")
}

main()
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
