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

// Pembayaran wajib aktif di Vercel; lokal tanpa kunci Midtrans pesanan langsung dianggap dibayar
if (process.env.VERCEL && !process.env.MIDTRANS_SERVER_KEY) {
    throw new Error("MIDTRANS_SERVER_KEY belum diisi (Vercel > Settings > Environment Variables).")
}

export const config = {
    isProduction,
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    uploadDir: path.join(rootDir, "uploads"),
    // build frontend (npm run build di root) yang ikut dilayani server di production
    clientDistDir: path.resolve(rootDir, "..", "dist"),
    midtrans: {
        serverKey: process.env.MIDTRANS_SERVER_KEY || "",
        clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    },
    // email (SMTP). Kosong = email dicetak di log server
    smtp: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
        from: process.env.MAIL_FROM || process.env.SMTP_USER || "Balanjo <no-reply@balanjo.local>",
    },
    // potongan platform per penjualan (persen), disimpan per item saat checkout
    platformFeePercent: Math.min(100, Math.max(0, Number(process.env.PLATFORM_FEE_PERCENT ?? 5) || 0)),
}
