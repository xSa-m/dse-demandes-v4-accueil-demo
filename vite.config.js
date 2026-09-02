import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 45221,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 45221,
    strictPort: true,
  },
})
