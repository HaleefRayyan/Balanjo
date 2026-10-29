import { Router } from "express"
import { prisma } from "../db.js"
import { requireAdmin } from "../middleware/auth.js"
import { HttpError, notFound, parseId } from "../utils/http.js"
import { serializeUser } from "../utils/serialize.js"

const router = Router()
router.use(requireAdmin)

router.get("/stats", async (req, res) => {
    const [users, sellers, blogs, forums] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { products: { some: {} } } }),
        prisma.blog.count(),
        prisma.forumPost.count(),
    ])
    res.json({ stats: { users, sellers, blogs, forums } })
})

router.get("/users", async (req, res) => {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } })
    res.json({ users: users.map(serializeUser) })
})

// Menghapus user ikut menghapus blog, diskusi, balasan, dan pesanannya (onDelete: Cascade)
router.delete("/users/:id", async (req, res) => {
    const id = parseId(req.params.id)
    if (id === req.user.id) throw new HttpError(400, "Kamu tidak bisa menghapus akunmu sendiri.")
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw notFound("User")
    await prisma.user.delete({ where: { id } })
    res.status(204).end()
})

export default router
