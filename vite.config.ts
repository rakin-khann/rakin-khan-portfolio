import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The dev/preview servers are proxied under a generated public host,
// so every host header must be accepted.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
})
