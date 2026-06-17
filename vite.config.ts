import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// leorek.github.io is a user page -> served from root, base '/'
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
