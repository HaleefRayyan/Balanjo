import { Router } from "express"
import { prisma } from "../db.js"
import { requireAuth } from "../middleware/auth.js"
import { parseId } from "../utils/http.js"

const router = Router()
router.use(requireAuth)

const serialize = (notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    read: Boolean(notification.readAt),
    createdAt: notification.createdAt,
})

// 30 terbaru + jumlah yang belum dibaca (untuk badge lonceng)
router.get("/", async (req, res) => {
    const [notifications, unread] = await Promise.all([
        prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
        prisma.notification.count({ where: { userId: req.user.id, readAt: null } }),
    ])
    res.json({ notifications: notifications.map(serialize), unread })
})

router.post("/read-all", async (req, res) => {
    await prisma.notification.updateMany({ where: { userId: req.user.id, readAt: null }, data: { readAt: new Date() } })
    res.status(204).end()
})

// hanya milik sendiri (id orang lain diabaikan diam-diam)
router.post("/:id/read", async (req, res) => {
    await prisma.notification.updateMany({ where: { id: parseId(req.params.id), userId: req.user.id, readAt: null }, data: { readAt: new Date() } })
    res.status(204).end()
})

export default router
