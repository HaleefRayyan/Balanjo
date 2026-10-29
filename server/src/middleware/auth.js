import jwt from "jsonwebtoken"
import { config } from "../config.js"
import { prisma } from "../db.js"
import { ROLES } from "../constants.js"
import { HttpError } from "../utils/http.js"

export const COOKIE_NAME = "balanjo_token"
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

// Token disimpan di cookie httpOnly (tidak bisa dibaca JavaScript halaman) + SameSite=Lax
// sehingga tidak ikut terkirim pada POST lintas situs (perlindungan CSRF).
export const setAuthCookie = (res, user) => {
    const token = jwt.sign({ sub: String(user.id) }, config.jwtSecret, { expiresIn: "7d" })
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.isProduction,
        maxAge: MAX_AGE_MS,
        path: "/",
    })
}

export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, { path: "/" })

// Dipasang global: isi req.user kalau cookie valid, selain itu lanjut sebagai tamu
export const authenticate = async (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) return next()
    try {
        const { sub } = jwt.verify(token, config.jwtSecret)
        // ambil dari DB supaya user yang dihapus / ganti role langsung berlaku
        req.user = await prisma.user.findUnique({ where: { id: Number(sub) } })
        if (!req.user) clearAuthCookie(res)
    } catch {
        clearAuthCookie(res)
    }
    next()
}

export const requireAuth = (req, res, next) => {
    if (!req.user) throw new HttpError(401, "Silakan login terlebih dahulu.")
    next()
}

export const requireAdmin = (req, res, next) => {
    if (!req.user) throw new HttpError(401, "Silakan login terlebih dahulu.")
    if (req.user.role !== ROLES.ADMIN) throw new HttpError(403, "Hanya admin yang boleh mengakses.")
    next()
}

export const isOwnerOrAdmin = (user, ownerId) => user.role === ROLES.ADMIN || user.id === ownerId
