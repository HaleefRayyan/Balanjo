import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import multer from "multer"
import { config } from "../config.js"
import { HttpError } from "./http.js"

// SVG sengaja tidak diizinkan (bisa berisi script)
const EXTENSIONS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" }
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const newUploadName = (ext) => `${crypto.randomUUID()}${ext}`

export const upload = multer({
    storage: multer.diskStorage({
        destination: config.uploadDir,
        filename: (req, file, cb) => cb(null, newUploadName(EXTENSIONS[file.mimetype])),
    }),
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    fileFilter: (req, file, cb) => {
        if (EXTENSIONS[file.mimetype]) cb(null, true)
        else cb(new HttpError(400, "Gambar harus JPG, PNG, WEBP, atau GIF."))
    },
})

export const fileUrl = (file) => (file ? `/uploads/${file.filename}` : null)

// Hapus file upload milik record yang dihapus/diganti. Setiap record punya file sendiri
// (seed juga menyalin per record), jadi aman dihapus. Error diabaikan.
export const removeUpload = async (url) => {
    if (!url?.startsWith("/uploads/")) return
    const name = path.basename(url)
    await fs.unlink(path.join(config.uploadDir, name)).catch(() => {})
}

// Salin file upload yang sudah ada ke nama baru (dipakai saat request banner disetujui)
export const copyUpload = async (url) => {
    const name = newUploadName(path.extname(url))
    await fs.copyFile(path.join(config.uploadDir, path.basename(url)), path.join(config.uploadDir, name))
    return `/uploads/${name}`
}
