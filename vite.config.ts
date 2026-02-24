import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Aether Veil: Luminara Echoes',
        short_name: 'Luminara',
        description: 'Mature luminous 3D gacha RPG',
        theme_color: '#1a1423',
        background_color: '#0f0a14',
        display: 'fullscreen',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,glb,png,webp}'],
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 1600,
  }
})
