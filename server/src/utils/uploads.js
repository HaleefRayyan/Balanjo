// Penyimpanan gambar upload:
// - Vercel Blob kalau BLOB_READ_WRITE_TOKEN diisi (production di Vercel: disk server tidak permanen)
// - folder server/uploads kalau tidak (development lokal, tanpa akun apa pun)
import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import multer from "multer"
import { copy, del, put } from "@vercel/blob"
import { config } from "../config.js"
import { HttpError } from "./http.js"

// SVG sengaja tidak diizinkan (bisa berisi script)
export const EXTENSIONS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" }
// Fungsi Vercel menerima body maksimal ~4,5 MB, jadi batas upload 4 MB
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
const isBlobUrl = (url) => {
    try {
        return new URL(url).hostname.endsWith(".blob.vercel-storage.com")
    } catch {
        return false
    }
}

const newName = (ext) => `${crypto.randomUUID()}${ext}`

// Simpan isi file, kembalikan URL publiknya
export const saveBuffer = async (buffer, ext, contentType) => {
    const name = newName(ext)
    if (useBlob) {
        const blob = await put(`uploads/${name}`, buffer, { access: "public", contentType, addRandomSuffix: false })
        return blob.url
    }
    await fs.mkdir(config.uploadDir, { recursive: true })
    await fs.writeFile(path.join(config.uploadDir, name), buffer)
    return `/uploads/${name}`
}

// File disimpan di memori dulu, lalu dipindah ke penyimpanan oleh storeUpload
const parseImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    fileFilter: (req, file, cb) => {
        if (EXTENSIONS[file.mimetype]) cb(null, true)
        else cb(new HttpError(400, "Gambar harus JPG, PNG, WEBP, atau GIF."))
    },
}).single("image")

const storeUpload = async (req, res, next) => {
    if (req.file) req.file.url = await saveBuffer(req.file.buffer, EXTENSIONS[req.file.mimetype], req.file.mimetype)
    next()
}

// Middleware untuk field multipart "image": `router.post("/", uploadImage, handler)`.
// Setelahnya URL gambar ada di fileUrl(req.file).
export const uploadImage = [parseImage, storeUpload]

export const fileUrl = (file) => file?.url ?? null

// Hapus gambar milik record yang dihapus/diganti. Setiap record punya file sendiri
// (seed juga menyimpan per record), jadi aman dihapus. Error diabaikan.
export const removeUpload = async (url) => {
    if (!url) return
    if (isBlobUrl(url)) {
        await del(url).catch(() => {})
    } else if (url.startsWith("/uploads/")) {
        await fs.unlink(path.join(config.uploadDir, path.basename(url))).catch(() => {})
    }
}

// Salin gambar ke nama baru (dipakai saat request banner disetujui)
export const copyUpload = async (url) => {
    const ext = path.extname(new URL(url, "http://local").pathname)
    if (isBlobUrl(url)) {
        const blob = await copy(url, `uploads/${newName(ext)}`, { access: "public", addRandomSuffix: false })
        return blob.url
    }
    const buffer = await fs.readFile(path.join(config.uploadDir, path.basename(url)))
    const name = newName(ext)
    await fs.writeFile(path.join(config.uploadDir, name), buffer)
    return `/uploads/${name}`
}
