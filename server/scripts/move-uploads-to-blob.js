// Memindahkan gambar yang masih tersimpan di folder lokal (server/uploads) ke Vercel Blob,
// lalu mengganti alamatnya di database. Dipakai sekali setelah seed/upload dilakukan tanpa
// BLOB_READ_WRITE_TOKEN. Aman dijalankan ulang: hanya alamat "/uploads/..." yang diproses.
//
//   npm run move-uploads-to-blob -- --dry-run   (lihat dulu apa yang akan dipindah, tanpa mengubah apa pun)
//   npm run move-uploads-to-blob                (pindahkan)
import fs from "node:fs/promises"
import path from "node:path"
import { PrismaClient } from "@prisma/client"
import { config } from "../src/config.js"
import { EXTENSIONS, saveBuffer } from "../src/utils/uploads.js"

const dryRun = process.argv.includes("--dry-run")
if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN belum diisi di server/.env (ambil dari Vercel > Storage > Blob store > .env.local).")
    process.exit(1)
}

// tabel + kolom yang menyimpan alamat gambar
const targets = [
    ["user", "avatarUrl"],
    ["blog", "coverUrl"],
    ["forumPost", "imageUrl"],
    ["product", "photoUrl"],
    ["banner", "imageUrl"],
    ["bannerRequest", "imageUrl"],
]
const contentTypes = Object.fromEntries(Object.entries(EXTENSIONS).map(([type, ext]) => [ext, type]))

const prisma = new PrismaClient()
let moved = 0
let missing = 0
try {
    for (const [model, column] of targets) {
        const rows = await prisma[model].findMany({
            where: { [column]: { startsWith: "/uploads/" } },
            select: { id: true, [column]: true },
        })
        if (rows.length) console.log(`${model}.${column}: ${rows.length} gambar lokal`)

        for (const row of rows) {
            const localUrl = row[column]
            const file = path.join(config.uploadDir, path.basename(localUrl))
            const buffer = await fs.readFile(file).catch(() => null)
            if (!buffer) {
                console.warn(`  ! ${model} #${row.id}: file ${localUrl} tidak ada di server/uploads, dilewati`)
                missing++
                continue
            }
            if (dryRun) {
                console.log(`  ${model} #${row.id}: ${localUrl} (akan dipindah)`)
                continue
            }
            const ext = path.extname(file)
            const blobUrl = await saveBuffer(buffer, ext, contentTypes[ext] ?? "application/octet-stream")
            await prisma[model].update({ where: { id: row.id }, data: { [column]: blobUrl } })
            moved++
            console.log(`  ${model} #${row.id}: dipindah`)
        }
    }
    console.log(dryRun
        ? `\nDry run selesai, tidak ada yang diubah.${missing ? ` ${missing} file tidak ditemukan.` : ""}`
        : `\nSelesai: ${moved} gambar dipindah ke Vercel Blob.${missing ? ` ${missing} file tidak ditemukan.` : ""}`)
} finally {
    await prisma.$disconnect()
}
