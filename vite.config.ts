import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://<user>.github.io/armazem-ficcao/, so dev, preview and tests use the same base path.
export default defineConfig({
  base: '/armazem-ficcao/',
  plugins: [react()],
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  server: { port: 5173, strictPort: true },
})
