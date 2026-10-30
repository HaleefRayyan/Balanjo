// Notifikasi: disimpan untuk ikon lonceng, dan (opsional) dikirim ke email.
// Dijalankan di belakang layar: kegagalan email tidak menggagalkan permintaan yang memicunya.
// Di Vercel, waitUntil menjaga function tetap hidup sampai email terkirim.
import { waitUntil } from "@vercel/functions"
import { prisma } from "../db.js"
import { sendEmail } from "./mailer.js"

// userIds: satu id atau array. message: { type, title, body, link, linkLabel, email: [baris tambahan] | false }
const deliver = async (userIds, message) => {
    const ids = [...new Set([userIds].flat().filter(Boolean))]
    if (ids.length === 0) return
    await prisma.notification.createMany({
        data: ids.map((userId) => ({ userId, type: message.type, title: message.title, body: message.body, link: message.link ?? null })),
    })
    if (message.email === false) return
    const users = await prisma.user.findMany({ where: { id: { in: ids }, emailNotifications: true }, select: { email: true } })
    await Promise.all(users.map((user) => sendEmail({
        to: user.email,
        subject: message.title,
        lines: [message.body, ...(message.email ?? [])],
        link: message.link,
        linkLabel: message.linkLabel,
    }).catch((error) => console.error(`Email "${message.title}" ke ${user.email} gagal:`, error.message))))
}

const run = (promise) => {
    const task = promise.catch((error) => console.error("Notifikasi gagal:", error.message))
    waitUntil(task)
    return task
}

export const notify = (userIds, message) => run(deliver(userIds, message))

// Jalankan kejadian (events.js) tanpa menahan respons
export const background = (promise) => run(promise)

export const notifyAdmins = (message) => run(
    prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } }).then((admins) => deliver(admins.map((admin) => admin.id), message)),
)
