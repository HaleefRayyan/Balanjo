import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const isProduction = process.env.NODE_ENV === "production"

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum diisi. Jalankan `npm run setup` di folder server, atau isi server/.env.")
}

export const config = {
    isProduction,
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    uploadDir: path.join(rootDir, "uploads"),
    // build frontend (npm run build di root) yang ikut dilayani server di production
    clientDistDir: path.resolve(rootDir, "..", "dist"),
}
