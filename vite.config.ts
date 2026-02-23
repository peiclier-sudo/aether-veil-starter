import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

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
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,glb,png,webp,jpg,svg}'],
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/assets\.babylonjs\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'babylon-assets' }
          }
        ]
      }
    }),
    {
      name: 'chunk-split',
      config() {
        return {
          build: {
            rollupOptions: {
              output: {
                manualChunks: {
                  babylon: ['babylonjs', 'babylonjs-loaders', 'babylonjs-gui', '@babylonjs/core']
                }
              }
            }
          }
        }
      }
    }
  ],
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 1600,
    sourcemap: false
  }
})
