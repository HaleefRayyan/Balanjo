import crypto from "node:crypto"
import { Router } from "express"
import bcrypt from "bcryptjs"
import rateLimit from "express-rate-limit"
import { z } from "zod"
import { config } from "../config.js"
import { prisma } from "../db.js"
import { clearAuthCookie, requireAuth, setAuthCookie } from "../middleware/auth.js"
import { HttpError, parse } from "../utils/http.js"
import { serializeUser } from "../utils/serialize.js"
import { fileUrl, removeUpload, uploadImage } from "../utils/uploads.js"

const router = Router()

// Batasi percobaan login/daftar/reset per IP untuk memperlambat tebak-tebakan password
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." } })

const email = z.string().trim().toLowerCase().email("Email tidak valid.")
const password = z.string().min(8, "Password minimal 8 karakter.").max(128)
const HASH_ROUNDS = 10
const RESET_TTL_MS = 60 * 60 * 1000

// username unik dari bagian depan email: budi@gmail.com -> budi, budi2, ...
const uniqueUsername = async (emailAddress) => {
    const base = emailAddress.split("@")[0].toLowerCase().replace(/[^a-z0-9_.]/g, "") || "user"
    let username = base
    for (let n = 2; await prisma.user.findUnique({ where: { username } }); n++) username = `${base}${n}`
    return username
}

// "Budi Santoso Putra" -> { firstName: "Budi", lastName: "Santoso Putra" }
const splitName = (fullName) => {
    const [firstName, ...rest] = fullName.trim().split(/\s+/)
    return { firstName, lastName: rest.join(" ") || null }
}

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

router.post("/register", authLimiter, async (req, res) => {
    const data = parse(z.object({ name: z.string().trim().min(1, "Nama wajib diisi.").max(80), email, password }), req.body)
    if (await prisma.user.findUnique({ where: { email: data.email } })) {
        throw new HttpError(409, "Email sudah terdaftar.")
    }
    const user = await prisma.user.create({
        data: {
            name: data.name,
            ...splitName(data.name),
            email: data.email,
            username: await uniqueUsername(data.email),
            passwordHash: await bcrypt.hash(data.password, HASH_ROUNDS),
        },
    })
    setAuthCookie(res, user)
    res.status(201).json({ user: serializeUser(user) })
})

router.post("/login", authLimiter, async (req, res) => {
    const data = parse(z.object({ email, password: z.string().min(1, "Password wajib diisi.") }), req.body)
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    // pesan sama untuk email salah & password salah, supaya tidak membocorkan email terdaftar
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
        throw new HttpError(401, "Email atau password salah.")
    }
    setAuthCookie(res, user)
    res.json({ user: serializeUser(user) })
})

router.post("/logout", (req, res) => {
    clearAuthCookie(res)
    res.status(204).end()
})

router.get("/me", (req, res) => {
    res.json({ user: req.user ? serializeUser(req.user) : null })
})

// ---------- Profil ----------

// firstName wajib; lastName boleh kosong (banyak nama satu kata); name = nama tampilan
router.patch("/me", requireAuth, async (req, res) => {
    const data = parse(z.object({
        firstName: z.string().trim().min(1, "Nama depan wajib diisi.").max(40),
        lastName: z.string().trim().max(40).optional().transform((value) => value || null),
        name: z.string().trim().min(1, "Nama tampilan wajib diisi.").max(80),
        email,
    }), req.body)
    if (data.email !== req.user.email && await prisma.user.findUnique({ where: { email: data.email } })) {
        throw new HttpError(409, "Email sudah dipakai akun lain.")
    }
    const user = await prisma.user.update({ where: { id: req.user.id }, data })
    res.json({ user: serializeUser(user) })
})

// multipart: image
router.put("/me/avatar", requireAuth, uploadImage, async (req, res) => {
    if (!req.file) throw new HttpError(400, "Pilih foto profil.")
    const user = await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: fileUrl(req.file) } })
    await removeUpload(req.user.avatarUrl)
    res.json({ user: serializeUser(user) })
})

router.delete("/me/avatar", requireAuth, async (req, res) => {
    const user = await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: null } })
    await removeUpload(req.user.avatarUrl)
    res.json({ user: serializeUser(user) })
})

router.post("/change-password", requireAuth, async (req, res) => {
    const data = parse(z.object({ oldPassword: z.string().min(1, "Password lama wajib diisi."), newPassword: password }), req.body)
    if (!(await bcrypt.compare(data.oldPassword, req.user.passwordHash))) {
        throw new HttpError(400, "Password lama salah.")
    }
    if (data.oldPassword === data.newPassword) throw new HttpError(400, "Password baru harus berbeda dari password lama.")
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: await bcrypt.hash(data.newPassword, HASH_ROUNDS) } })
    res.status(204).end()
})

// Selalu membalas 200 (tidak membocorkan apakah email terdaftar).
// Belum ada layanan email: link reset dicetak di console server.
router.post("/forgot-password", authLimiter, async (req, res) => {
    const data = parse(z.object({ email }), req.body)
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (user) {
        const token = crypto.randomBytes(32).toString("hex")
        await prisma.passwordResetToken.create({
            data: { tokenHash: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
        })
        console.log(`[reset password] ${user.email}: ${config.clientUrl}/reset-password?token=${token}`)
    }
    res.json({ ok: true })
})

router.post("/reset-password", authLimiter, async (req, res) => {
    const data = parse(z.object({ token: z.string().min(1), password }), req.body)
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(data.token) } })
    if (!record || record.usedAt || record.expiresAt < new Date()) {
        throw new HttpError(400, "Link reset tidak valid atau sudah kedaluwarsa.")
    }
    await prisma.$transaction([
        prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(data.password, HASH_ROUNDS) } }),
        prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ])
    res.status(204).end()
})

export default router
