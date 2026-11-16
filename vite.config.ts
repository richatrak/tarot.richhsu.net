import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH lets GitHub Pages serve from /<repo>/ ; defaults to root.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? 'dev') },
  base,
  plugins: [
    preact(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '靜心塔羅',
        short_name: '靜心塔羅',
        description: '繁體中文塔羅反思工具，可離線使用。',
        lang: 'zh-Hant-TW',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'any',
        background_color: '#14122b',
        theme_color: '#14122b',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
