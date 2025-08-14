import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true,
    allowedHosts: [
      'cami3d.discloud.app',
      'localhost',
      '127.0.0.1'
    ]
  }
})
