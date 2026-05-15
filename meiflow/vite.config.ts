import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { execSync } from 'child_process'

function getGitInfo() {
  try {
    const hash = execSync('git log -1 --format=%h').toString().trim()
    const date = execSync('git log -1 --format=%cI').toString().trim()
    return { hash, date }
  } catch {
    return { hash: 'unknown', date: '' }
  }
}

const { hash: COMMIT_HASH, date: COMMIT_DATE } = getGitInfo()

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(COMMIT_HASH),
    __COMMIT_DATE__: JSON.stringify(COMMIT_DATE),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'MEIFlow',
        short_name: 'MEIFlow',
        description: 'Plataforma completa para freelancers e MEIs brasileiros',
        theme_color: '#0D1117',
        background_color: '#0D1117',
        display: 'standalone',
        // display_override: tenta fullscreen/standalone primeiro — comportamento
        // de app nativo (sem browser chrome) quando suportado pelo SO.
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        start_url: '/',
        scope: '/',
        id: '/',
        lang: 'pt-BR',
        dir: 'ltr',
        orientation: 'portrait-primary',
        categories: ['business', 'finance', 'productivity'],
        // launch_handler: focus-existing impede que cliques externos abram
        // múltiplas instâncias — comportamento de aplicativo nativo singleton.
        launch_handler: {
          client_mode: ['focus-existing', 'auto'],
        },
        prefer_related_applications: false,
        // App shortcuts no long-press do ícone na home screen Android
        shortcuts: [
          {
            name: 'Novo cliente',
            short_name: 'Cliente',
            description: 'Cadastrar um novo cliente',
            url: '/clients?new=1',
            icons: [{ src: 'logo-192.png', sizes: '192x192' }],
          },
          {
            name: 'Novo projeto',
            short_name: 'Projeto',
            description: 'Criar um novo projeto',
            url: '/projects?new=1',
            icons: [{ src: 'logo-192.png', sizes: '192x192' }],
          },
          {
            name: 'Pagamentos',
            short_name: 'Pagamentos',
            description: 'Acompanhar pagamentos',
            url: '/payments',
            icons: [{ src: 'logo-192.png', sizes: '192x192' }],
          },
        ],
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'logo-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // SPA fallback: qualquer rota navegada (clients/, projects/, contracts/, etc.)
        // serve o index.html do cache — assim o PWA abre offline em qualquer rota.
        navigateFallback: '/index.html',
        // Rotas que NÃO devem cair no fallback (deixa o SW responder normalmente).
        navigateFallbackDenylist: [/^\/api\//],
        // Garantir que SW novo assume controle imediatamente após atualização
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Arquivos reais das fontes — Cache-first com expiração longa
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Rota pública de aceite — cache-first para abrir mesmo offline
            // (o conteúdo do contrato em si vem do Dexie/IndexedDB do dono)
            urlPattern: /\/contract\/[^/]+$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'contract-public-pages',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
