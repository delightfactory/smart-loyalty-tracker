import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // manual register in main.tsx
      manifestFilename: 'manifest.webmanifest',
      includeAssets: ['favicon.ico', 'robots.txt', 'pwa-192x192.png', 'pwa-512x512.png'],
      devOptions: { enabled: true }, // enable SW in dev for testing
      manifest: {
        name: 'Smart Loyalty Tracker',
        short_name: 'Loyalty',
        description: 'تطبيق تتبع الولاء الذكي',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          { urlPattern: /^https:\/\/.*supabase\.co\/.*/, handler: 'NetworkOnly' }
        ]
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
