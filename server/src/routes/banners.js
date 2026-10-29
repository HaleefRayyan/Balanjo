import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { BANNER_REQUEST_STATUSES } from "../constants.js"
import { requireAdmin, requireAuth } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializeBanner, serializeBannerRequest } from "../utils/serialize.js"
import { copyUpload, fileUrl, removeUpload, upload } from "../utils/uploads.js"

const router = Router()
const label = z.string().trim().min(1, "Id banner wajib diisi.").max(60)

// ---------- Banner slider (publik baca, admin kelola) ----------

router.get("/", async (req, res) => {
    const banners = await prisma.banner.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] })
    res.json({ banners: banners.map(serializeBanner) })
})

router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
    try {
        const data = parse(z.object({ label }), req.body)
        if (!req.file) throw new HttpError(400, "Gambar wajib diunggah.")
        if (await prisma.banner.findFirst({ where: { label: data.label } })) throw new HttpError(409, "Id banner sudah dipakai.")
        const banner = await prisma.banner.create({ data: { label: data.label, imageUrl: fileUrl(req.file) } })
        res.status(201).json({ banner: serializeBanner(banner) })
    } catch (error) {
        if (req.file) await removeUpload(fileUrl(req.file))
        throw error
    }
})

// ganti gambar (label tidak bisa diubah, sama seperti form di admin)
router.put("/:id", requireAdmin, upload.single("image"), async (req, res) => {
    try {
        const banner = await prisma.banner.findUnique({ where: { id: parseId(req.params.id) } })
        if (!banner) throw notFound("Banner")
        if (!req.file) throw new HttpError(400, "Gambar wajib diunggah.")
        const updated = await prisma.banner.update({ where: { id: banner.id }, data: { imageUrl: fileUrl(req.file) } })
        await removeUpload(banner.imageUrl)
        res.json({ banner: serializeBanner(updated) })
    } catch (error) {
        if (req.file) await removeUpload(fileUrl(req.file))
        throw error
    }
})

router.delete("/:id", requireAdmin, async (req, res) => {
    const banner = await prisma.banner.findUnique({ where: { id: parseId(req.params.id) } })
    if (!banner) throw notFound("Banner")
    await prisma.banner.delete({ where: { id: banner.id } })
    await removeUpload(banner.imageUrl)
    res.status(204).end()
})

// ---------- Pengajuan banner oleh seller ----------

const withRequestRelations = { product: { select: { id: true, name: true } }, seller: { select: { name: true } } }

router.get("/requests", requireAdmin, async (req, res) => {
    const requests = await prisma.bannerRequest.findMany({ include: withRequestRelations, orderBy: { createdAt: "desc" } })
    res.json({ requests: requests.map(serializeBannerRequest) })
})

// Seller mengajukan banner untuk produknya sendiri (multipart: productId, image)
router.post("/requests", requireAuth, upload.single("image"), async (req, res) => {
    try {
        const data = parse(z.object({ productId: z.coerce.number().int().positive() }), req.body)
        if (!req.file) throw new HttpError(400, "Gambar wajib diunggah.")
        const product = await prisma.product.findUnique({ where: { id: data.productId } })
        if (!product) throw notFound("Produk")
        if (product.sellerId !== req.user.id) throw new HttpError(403, "Hanya seller produk ini yang boleh mengajukan banner.")
        const request = await prisma.bannerRequest.create({
            data: { productId: product.id, sellerId: req.user.id, imageUrl: fileUrl(req.file) },
            include: withRequestRelations,
        })
        res.status(201).json({ request: serializeBannerRequest(request) })
    } catch (error) {
        if (req.file) await removeUpload(fileUrl(req.file))
        throw error
    }
})

// Disetujui -> salinan gambarnya jadi banner slider; dibatalkan/ditolak -> banner itu dihapus lagi
router.patch("/requests/:id", requireAdmin, async (req, res) => {
    const { status } = parse(z.object({ status: z.enum(BANNER_REQUEST_STATUSES, { error: "Status tidak valid." }) }), req.body)
    const request = await prisma.bannerRequest.findUnique({ where: { id: parseId(req.params.id) }, include: { banner: true, product: true } })
    if (!request) throw notFound("Pengajuan banner")

    let bannerId = request.bannerId
    if (status === "APPROVED" && !request.banner) {
        const banner = await prisma.banner.create({
            data: { label: `Promo ${request.product.name} #${request.id}`, imageUrl: await copyUpload(request.imageUrl) },
        })
        bannerId = banner.id
    } else if (status !== "APPROVED" && request.banner) {
        await prisma.banner.delete({ where: { id: request.banner.id } })
        await removeUpload(request.banner.imageUrl)
        bannerId = null
    }

    const updated = await prisma.bannerRequest.update({
        where: { id: request.id },
        data: { status, bannerId },
        include: withRequestRelations,
    })
    res.json({ request: serializeBannerRequest(updated) })
})

export default router
