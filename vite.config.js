import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Saat development, /api dan /uploads diteruskan ke backend (server/, port 3000),
// jadi frontend & API terlihat satu origin (cookie login ikut terkirim).
const API_URL = 'http://localhost:3000'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': API_URL,
      '/uploads': API_URL,
    },
  },
})
