import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Target older Android WebView (SM-T350 runs Android 5.1.1)
    target: 'es2015',
  },
  server: {
    // Accessible from other devices on the network for testing
    host: true,
    port: 5173,
  },
})
