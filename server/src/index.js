import fs from "node:fs"
import { config } from "./config.js"
import { createApp } from "./app.js"

fs.mkdirSync(config.uploadDir, { recursive: true })

createApp().listen(config.port, () => {
    console.log(`Balanjo API berjalan di http://localhost:${config.port}`)
})
