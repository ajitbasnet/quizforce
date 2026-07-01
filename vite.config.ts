import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import type { Connect } from 'vite'
import { handleGenerateQuiz } from './api/lib/handleGenerateQuiz'

function createGenerateQuizProxy(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(chunk as Buffer)
    })
    req.on('end', () => {
      void (async () => {
        try {
          const body = Buffer.concat(chunks)
          const request = new Request('http://localhost/api/generate-quiz', {
            method: req.method ?? 'POST',
            headers: {
              'content-type': req.headers['content-type'] ?? 'application/json',
              origin: req.headers.origin ?? 'http://localhost:5173',
              'x-forwarded-for': req.socket.remoteAddress ?? '127.0.0.1',
            },
            body: req.method === 'OPTIONS' ? undefined : body,
          })
          const response = await handleGenerateQuiz(request, {
            apiKey: process.env.ANTHROPIC_API_KEY,
            allowedOrigins: process.env.ALLOWED_ORIGINS,
          })
          res.statusCode = response.status
          response.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })
          const responseBody = await response.arrayBuffer()
          if (responseBody.byteLength > 0) {
            res.end(Buffer.from(responseBody))
          } else {
            res.end()
          }
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
