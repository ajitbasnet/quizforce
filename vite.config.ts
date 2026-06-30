import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import type { Connect } from 'vite'
import { forwardToAnthropic } from './api/lib/forwardToAnthropic'

function createGenerateQuizProxy(): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end('Method not allowed')
      return
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      res.statusCode = 500
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ error: { message: 'Missing ANTHROPIC_API_KEY' } }))
      return
    }

    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(chunk as Buffer)
    })
    req.on('end', () => {
      void (async () => {
        try {
          const body = Buffer.concat(chunks).toString()
          const request = new Request('http://localhost/api/generate-quiz', {
            method: 'POST',
            headers: {
              'content-type': req.headers['content-type'] ?? 'application/json',
            },
            body,
          })
          const response = await forwardToAnthropic(request, apiKey)
          res.statusCode = response.status
          response.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch {
          res.statusCode = 502
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: { message: 'Proxy error' } }))
        }
      })()
    })
    req.on('error', next)
  }
}

function apiProxyPlugin(): Plugin {
  const attachProxy = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use('/api/generate-quiz', createGenerateQuizProxy())
  }

  return {
    name: 'api-proxy',
    configureServer: attachProxy,
    configurePreviewServer: attachProxy,
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    apiProxyPlugin(),
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: 'dist/stats.html',
            gzipSize: true,
          }),
        ]
      : []),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: false,
      injectRegister: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
    }),
  ],
  resolve: {
    dedupe: ['i18next', 'react-i18next'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs'
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion'
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase'
          }
          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform') ||
            id.includes('node_modules/zod')
          ) {
            return 'forms'
          }
        },
      },
    },
  },
})
