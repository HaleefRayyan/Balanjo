import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { BLOG_CATEGORIES } from "../constants.js"
import { isOwnerOrAdmin, requireAuth } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializeBlog } from "../utils/serialize.js"
import { htmlToText, sanitizeArticle, slugify } from "../utils/text.js"
import { fileUrl, removeUpload, uploadImage } from "../utils/uploads.js"

const router = Router()
const withAuthor = { author: { select: { name: true, avatarUrl: true } } }

router.get("/", async (req, res) => {
    const query = parse(z.object({
        q: z.string().trim().max(100).optional(),
        category: z.enum(BLOG_CATEGORIES).optional(),
        authorId: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
    }), req.query)

    const blogs = await prisma.blog.findMany({
        where: {
            ...(query.category && { category: query.category }),
            ...(query.authorId && { authorId: query.authorId }),
            ...(query.q && { title: { contains: query.q, mode: "insensitive" } }),
        },
        include: withAuthor,
        orderBy: { createdAt: "desc" },
        take: query.limit,
    })
    res.json({ blogs: blogs.map((blog) => serializeBlog(blog)) })
})

router.get("/:slug", async (req, res) => {
    const blog = await prisma.blog.findUnique({ where: { slug: req.params.slug }, include: withAuthor })
    if (!blog) throw notFound("Artikel")
    res.json({ blog: serializeBlog(blog, { withBody: true }) })
})

const blogSchema = z.object({
    title: z.string().trim().min(1, "Judul wajib diisi.").max(150),
    category: z.enum(BLOG_CATEGORIES, { error: "Kategori tidak valid." }),
    body: z.string().max(200_000),
})

// body disanitasi; artikel tanpa teks ditolak
const parseBlog = (input) => {
    const data = parse(blogSchema, input)
    const body = sanitizeArticle(data.body)
    if (!htmlToText(body)) throw new HttpError(400, "Isi artikel wajib diisi.")
    return { ...data, body }
}

// multipart/form-data: title, category, body (HTML dari editor), image (opsional)
router.post("/", requireAuth, uploadImage, async (req, res) => {
    try {
        const { body, ...data } = parseBlog(req.body)

        const base = slugify(data.title) || "artikel"
        let slug = base
        for (let n = 2; await prisma.blog.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`

        const blog = await prisma.blog.create({
            data: { slug, title: data.title, category: data.category, body, coverUrl: fileUrl(req.file), authorId: req.user.id },
            include: withAuthor,
        })
        res.status(201).json({ blog: serializeBlog(blog, { withBody: true }) })
    } catch (error) {
        if (req.file) await removeUpload(fileUrl(req.file)) // jangan tinggalkan file kalau gagal
        throw error
    }
})

// Edit oleh penulis/admin. Slug sengaja tidak berubah supaya link lama tetap jalan.
// multipart: title, category, body, image (opsional, mengganti cover), removeImage=1 (hapus cover)
router.put("/:id", requireAuth, uploadImage, async (req, res) => {
    try {
        const blog = await prisma.blog.findUnique({ where: { id: parseId(req.params.id) } })
        if (!blog) throw notFound("Artikel")
        if (!isOwnerOrAdmin(req.user, blog.authorId)) throw new HttpError(403, "Kamu tidak boleh mengubah artikel ini.")
        const data = parseBlog(req.body)

        const coverUrl = req.file ? fileUrl(req.file) : req.body.removeImage === "1" ? null : blog.coverUrl
        const updated = await prisma.blog.update({ where: { id: blog.id }, data: { ...data, coverUrl }, include: withAuthor })
        if (coverUrl !== blog.coverUrl) await removeUpload(blog.coverUrl)
        res.json({ blog: serializeBlog(updated, { withBody: true }) })
    } catch (error) {
        if (req.file) await removeUpload(fileUrl(req.file))
        throw error
    }
})

router.delete("/:id", requireAuth, async (req, res) => {
    const blog = await prisma.blog.findUnique({ where: { id: parseId(req.params.id) } })
    if (!blog) throw notFound("Artikel")
    if (!isOwnerOrAdmin(req.user, blog.authorId)) throw new HttpError(403, "Kamu tidak boleh menghapus artikel ini.")
    await prisma.blog.delete({ where: { id: blog.id } })
    await removeUpload(blog.coverUrl)
    res.status(204).end()
})

export default router
