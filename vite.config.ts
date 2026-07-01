import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import type { Connect } from 'vite'
import { handleGenerateQuiz } from './api/lib/handleGenerateQuiz'

function resolveAnthropicApiKey(env: Record<string, string>): string | undefined {
  const key = env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your-anthropic-api-key') return undefined
  return key
}

function createGenerateQuizProxy(
  anthropicApiKey: string | undefined,
  allowedOrigins: string | undefined,
): Connect.NextHandleFunction {
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
            apiKey: anthropicApiKey,
            allowedOrigins,
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

function apiProxyPlugin(
  anthropicApiKey: string | undefined,
  allowedOrigins: string | undefined,
): Plugin {
  const attachProxy = (server: { middlewares: Connect.Server }) => {
    if (!anthropicApiKey) {
      console.warn(
        '[quizforge] ANTHROPIC_API_KEY is not set — quiz generation will fail. Copy .env.example to .env and add your Anthropic API key.',
      )
    }
    server.middlewares.use(
      '/api/generate-quiz',
      createGenerateQuizProxy(anthropicApiKey, allowedOrigins),
    )
  }

  return {
    name: 'api-proxy',
    configureServer: attachProxy,
    configurePreviewServer: attachProxy,
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const anthropicApiKey = resolveAnthropicApiKey(env)
  const allowedOrigins = env.ALLOWED_ORIGINS

  return {
  plugins: [
    react(),
    apiProxyPlugin(anthropicApiKey, allowedOrigins),
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
  }
})
