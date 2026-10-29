// Setup sekali jalan: buat .env (dengan JWT_SECRET acak) lalu buat database + isi data contoh.
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const envPath = path.join(root, ".env")

if (fs.existsSync(envPath)) {
    console.log(".env sudah ada, tidak diubah.")
} else {
    const example = fs.readFileSync(path.join(root, ".env.example"), "utf8")
    const secret = crypto.randomBytes(48).toString("hex")
    fs.writeFileSync(envPath, example.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET="${secret}"`))
    console.log("Membuat .env dengan JWT_SECRET acak.")
}

// Database yang sudah ada tidak disentuh (supaya setup ulang tidak menghapus data).
const dbPath = path.join(root, "prisma", "dev.db")
if (fs.existsSync(dbPath)) {
    console.log("Database sudah ada: hanya menerapkan migrasi baru. Untuk mengosongkan & mengisi ulang data contoh, jalankan `npm run db:reset`.")
    execSync("npx prisma migrate deploy", { cwd: root, stdio: "inherit" })
} else {
    // migrate reset pada database baru: buat tabel dari semua migrasi, lalu jalankan seed
    execSync("npx prisma migrate reset --force", { cwd: root, stdio: "inherit" })
}
