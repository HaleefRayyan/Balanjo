// Setup lokal: buat .env (dengan JWT_SECRET acak), terapkan migrasi ke database Neon,
// lalu isi data contoh kalau database masih kosong. Aman dijalankan ulang (data tidak dihapus).
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const envPath = path.join(root, ".env")

if (!fs.existsSync(envPath)) {
    const example = fs.readFileSync(path.join(root, ".env.example"), "utf8")
    const secret = crypto.randomBytes(48).toString("hex")
    fs.writeFileSync(envPath, example.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET="${secret}"`))
    console.log("Membuat server/.env dengan JWT_SECRET acak.")
}

const env = fs.readFileSync(envPath, "utf8")
if (/ep-xxxx|USER:PASSWORD/.test(env) || !/^DATABASE_URL=/m.test(env) || !/^DIRECT_URL=/m.test(env)) {
    console.log("\nIsi DATABASE_URL dan DIRECT_URL di server/.env dengan connection string dari Neon,")
    console.log("lalu jalankan `npm run setup` lagi. Lihat README bagian Setup.\n")
    process.exit(1)
}

// migrate deploy: hanya menerapkan migrasi yang belum ada (tidak menghapus data)
execSync("npx prisma migrate deploy", { cwd: root, stdio: "inherit" })
// seed melewati dirinya sendiri kalau database sudah berisi data
execSync("node --env-file=.env prisma/seed.js", { cwd: root, stdio: "inherit" })
