// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Se você usa Tailwind via plugin oficial do Vite, mantenha; caso não use, pode remover esta linha.
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Remova "tailwindcss()" se você não tiver instalado @tailwindcss/vite
    tailwindcss(),
    VitePWA({
      // Atualiza o SW automaticamente quando há nova versão
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // permite testar PWA em `pnpm run dev`
      },
      manifest: {
        name: 'FA - Finance App',
        short_name: 'FA',
        description: 'Gerenciador financeiro PWA',
        theme_color: '#d62828',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        categories: ['finance', 'productivity'],
        icons: [
          // Garanta que esses arquivos existam em /public/icons/
          { src: '/icons/fa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/fa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/fa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
          // iOS / extras
          { src: '/icons/fa-180.png', sizes: '180x180', type: 'image/png' },
          { src: '/icons/fa-384.png', sizes: '384x384', type: 'image/png' },
        ],
        shortcuts: [
          { name: 'Nova despesa', url: '/despesas/nova', description: 'Adicionar despesa' },
          { name: 'Visão geral', url: '/dashboard' }
        ],
      },
      // Workbox para cache de assets e imagens
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-resources' },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 dias
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(gstatic|googleapis)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts' },
          },
        ],
      },
    }),
  ],

  // 👇 Corrige o erro de resolução em ambientes pnpm,
  // garantindo que 'workbox-window' seja pré-empacotado pelo Vite.
  optimizeDeps: {
    include: ['workbox-window'],
  },

  // (Opcional) Caso use paths absolutos/aliases
  // resolve: { alias: { '@': '/src' } },

  // (Opcional) Se quiser um base diferente em produção
  // base: '/',

  // (Opcional) Ajustes de build
  // build: {
  //   sourcemap: true,
  // },
})
