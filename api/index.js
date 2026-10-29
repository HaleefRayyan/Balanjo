// Entry point fungsi Vercel: semua request /api/* diarahkan ke sini (lihat vercel.json)
// dan diteruskan ke aplikasi Express yang sama dengan yang dipakai saat development.
import { createApp } from "../server/src/app.js"

export default createApp()
