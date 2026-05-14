import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
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
