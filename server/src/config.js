import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const isProduction = process.env.NODE_ENV === "production"

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum diisi. Jalankan `npm run setup` di folder server, atau isi server/.env.")
}

// Di Vercel disk server tidak permanen: gambar wajib disimpan di Vercel Blob
if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN belum diisi. Hubungkan Vercel Blob ke project ini (Storage > Blob).")
}

export const config = {
    isProduction,
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    uploadDir: path.join(rootDir, "uploads"),
    // build frontend (npm run build di root) yang ikut dilayani server di production
    clientDistDir: path.resolve(rootDir, "..", "dist"),
}
