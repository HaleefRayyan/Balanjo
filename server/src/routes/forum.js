import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db.js"
import { FORUM_CATEGORIES } from "../constants.js"
import { isOwnerOrAdmin, requireAuth } from "../middleware/auth.js"
import { HttpError, notFound, parse, parseId } from "../utils/http.js"
import { serializeComment, serializeForumPost } from "../utils/serialize.js"
import { fileUrl, removeUpload, upload } from "../utils/uploads.js"

const router = Router()
const withAuthor = { author: { select: { name: true } } }

router.get("/", async (req, res) => {
    const query = parse(z.object({ category: z.enum(FORUM_CATEGORIES).optional() }), req.query)
    const posts = await prisma.forumPost.findMany({
        where: query.category ? { category: query.category } : {},
        include: { ...withAuthor, _count: { select: { comments: true } } },
        orderBy: { createdAt: "desc" },
    })
    res.json({ posts: posts.map(serializeForumPost) })
})

router.get("/:id", async (req, res) => {
    const post = await prisma.forumPost.findUnique({
        where: { id: parseId(req.params.id) },
        include: { ...withAuthor, comments: { include: withAuthor, orderBy: { createdAt: "asc" } } },
    })
    if (!post) throw notFound("Diskusi")
    res.json({ post: serializeForumPost(post) })
})

// multipart/form-data: text, category, image (opsional)
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
    try {
        const data = parse(z.object({
            text: z.string().trim().min(1, "Isi diskusi wajib diisi.").max(280),
            category: z.enum(FORUM_CATEGORIES, { error: "Kategori tidak valid." }),
        }), req.body)
        const post = await prisma.forumPost.create({
            data: { ...data, imageUrl: fileUrl(req.file), authorId: req.user.id },
            include: { ...withAuthor, comments: true },
        })
        res.status(201).json({ post: serializeForumPost(post) })
    } catch (error) {
        if (req.file) await removeUpload(fileUrl(req.file))
        throw error
    }
})

router.post("/:id/comments", requireAuth, async (req, res) => {
    const postId = parseId(req.params.id)
    const data = parse(z.object({ text: z.string().trim().min(1, "Balasan wajib diisi.").max(1000) }), req.body)
    if (!(await prisma.forumPost.findUnique({ where: { id: postId } }))) throw notFound("Diskusi")
    const comment = await prisma.comment.create({
        data: { text: data.text, postId, authorId: req.user.id },
        include: withAuthor,
    })
    res.status(201).json({ comment: serializeComment(comment) })
})

router.delete("/:id", requireAuth, async (req, res) => {
    const post = await prisma.forumPost.findUnique({ where: { id: parseId(req.params.id) } })
    if (!post) throw notFound("Diskusi")
    if (!isOwnerOrAdmin(req.user, post.authorId)) throw new HttpError(403, "Kamu tidak boleh menghapus diskusi ini.")
    await prisma.forumPost.delete({ where: { id: post.id } })
    await removeUpload(post.imageUrl)
    res.status(204).end()
})

export default router
