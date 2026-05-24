import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Make main CSS non-blocking: preload + onload to apply (saves ~150ms on mobile)
function asyncCssPlugin() {
  return {
    name: 'async-css',
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string) {
        return html.replace(
          /<link rel="stylesheet"[^>]+href="(\/assets\/[^"]+\.css)"[^>]*>/g,
          '<link rel="preload" as="style" href="$1" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="$1"></noscript>'
        )
      },
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), asyncCssPlugin()],
  server: {
    host: true,
    allowedHosts: ['beta.tripointdiagnostics.co.uk'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/webhooks': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: isSsrBuild
          ? undefined
          : {
              motion: ['motion', 'framer-motion'],
            },
      },
    },
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
}))
