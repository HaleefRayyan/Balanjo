// Membuat (atau menjadikan) akun admin. Dipakai untuk production, di mana seed tidak boleh dijalankan.
//   npm run create-admin -- --email admin@contoh.com --name "Admin Balanjo"
// Password ditanyakan di terminal (tidak muncul di riwayat perintah).
// Kalau email sudah terdaftar, akun itu dijadikan admin dan password-nya diganti.
import readline from "node:readline/promises"
import { parseArgs } from "node:util"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const { values } = parseArgs({ options: { email: { type: "string" }, name: { type: "string" } } })
const email = values.email?.trim().toLowerCase()
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('Pakai: npm run create-admin -- --email admin@contoh.com --name "Admin Balanjo"')
    process.exit(1)
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const password = await rl.question("Password admin (minimal 12 karakter): ")
rl.close()
if (password.length < 12) {
    console.error("Password terlalu pendek. Untuk admin production pakai minimal 12 karakter.")
    process.exit(1)
}

const prisma = new PrismaClient()
try {
    const passwordHash = await bcrypt.hash(password, 10)
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN", passwordHash } })
        console.log(`Akun ${email} sekarang admin (password diganti).`)
    } else {
        const base = email.split("@")[0].replace(/[^a-z0-9_.]/g, "") || "admin"
        let username = base
        for (let n = 2; await prisma.user.findUnique({ where: { username } }); n++) username = `${base}${n}`
        await prisma.user.create({ data: { name: values.name?.trim() || "Admin", email, username, passwordHash, role: "ADMIN" } })
        console.log(`Admin ${email} dibuat. Login di /login.`)
    }
} finally {
    await prisma.$disconnect()
}
