import fs from "node:fs"
import path from "node:path"
import express from "express"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import multer from "multer"
import { config } from "./config.js"
import { authenticate } from "./middleware/auth.js"
import { HttpError } from "./utils/http.js"
import authRoutes from "./routes/auth.js"
import blogRoutes from "./routes/blogs.js"
import forumRoutes from "./routes/forum.js"
import productRoutes from "./routes/products.js"
import orderRoutes from "./routes/orders.js"
import bannerRoutes from "./routes/banners.js"
import adminRoutes from "./routes/admin.js"
import sellerRoutes from "./routes/seller.js"

export const createApp = () => {
    const app = express()
    app.disable("x-powered-by")
    app.set("trust proxy", 1) // IP asli di balik reverse proxy (untuk rate limit)

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                // frontend memuat Google Fonts dan memakai blob: untuk pratinjau gambar
                "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com"],
                "img-src": ["'self'", "data:", "blob:", "https://*.public.blob.vercel-storage.com"],
            },
        },
    }))
    app.use(express.json({ limit: "1mb" }))
    app.use(cookieParser())
    // fallthrough: false -> file yang tidak ada langsung 404 (tidak jatuh ke fallback SPA)
    app.use("/uploads", express.static(config.uploadDir, { maxAge: "7d", index: false, fallthrough: false }))

    app.use("/api", authenticate)
    app.use("/api/auth", authRoutes)
    app.use("/api/blogs", blogRoutes)
    app.use("/api/forum", forumRoutes)
    app.use("/api/products", productRoutes)
    app.use("/api/orders", orderRoutes)
    app.use("/api/banners", bannerRoutes)
    app.use("/api/admin", adminRoutes)
    app.use("/api/seller", sellerRoutes)
    app.use("/api", (req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan." }))

    // Production: layani hasil `npm run build` frontend + fallback SPA ke index.html
    if (fs.existsSync(config.clientDistDir)) {
        app.use(express.static(config.clientDistDir, { index: false }))
        app.get("/{*splat}", (req, res) => res.sendFile(path.join(config.clientDistDir, "index.html")))
    }

    // eslint-disable-next-line no-unused-vars -- Express butuh 4 argumen untuk error handler
    app.use((error, req, res, next) => {
        if (error instanceof HttpError) return res.status(error.status).json({ error: error.message })
        if (error instanceof multer.MulterError) {
            const message = error.code === "LIMIT_FILE_SIZE" ? "Ukuran gambar maksimal 4 MB." : "Upload gambar gagal."
            return res.status(400).json({ error: message })
        }
        if (error.type === "entity.parse.failed") return res.status(400).json({ error: "Body JSON tidak valid." })
        if (error.status === 404) return res.status(404).json({ error: "Tidak ditemukan." }) // mis. file upload yang tidak ada
        // error 4xx dari library (mis. path terlarang di /uploads): teruskan status-nya, pesan umum
        if (error.status >= 400 && error.status < 500) return res.status(error.status).json({ error: "Permintaan tidak valid." })
        console.error(error)
        res.status(500).json({ error: "Terjadi kesalahan di server." })
    })

    return app
}
