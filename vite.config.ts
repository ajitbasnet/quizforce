import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import type { Connect } from 'vite'
import { handleGenerateQuiz } from './api/lib/handleGenerateQuiz'
import { handleTranslateQuiz } from './api/lib/handleTranslateQuiz'

type QuizApiHandler = (
  request: Request,
  options: {
    geminiApiKey?: string
    groqApiKey?: string
    allowedOrigins?: string
  },
) => Promise<Response>

function createQuizApiProxy(
  apiPath: string,
  handler: QuizApiHandler,
  providerKeys: {
    geminiApiKey: string | undefined
    groqApiKey: string | undefined
  },
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
          const request = new Request(`http://localhost${apiPath}`, {
            method: req.method ?? 'POST',
            headers: {
              'content-type': req.headers['content-type'] ?? 'application/json',
              origin: req.headers.origin ?? 'http://localhost:5173',
              'x-forwarded-for': req.socket.remoteAddress ?? '127.0.0.1',
            },
            body: req.method === 'OPTIONS' ? undefined : body,
          })
          const response = await handler(request, {
            geminiApiKey: providerKeys.geminiApiKey,
            groqApiKey: providerKeys.groqApiKey,
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

function resolveProviderKeys(env: Record<string, string>): {
  geminiApiKey: string | undefined
  groqApiKey: string | undefined
} {
  const gemini = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY
  const groq = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY
  return {
    geminiApiKey:
      !gemini || gemini === 'your-gemini-api-key' ? undefined : gemini,
    groqApiKey: !groq || groq === 'your-groq-api-key' ? undefined : groq,
  }
}

function apiProxyPlugin(
  providerKeys: {
    geminiApiKey: string | undefined
    groqApiKey: string | undefined
  },
  allowedOrigins: string | undefined,
): Plugin {
  const attachProxy = (server: { middlewares: Connect.Server }) => {
    if (!providerKeys.geminiApiKey) {
      console.warn(
        '[quizforge] GEMINI_API_KEY is not set — quiz generation will fail. Copy .env.example to .env and add your Gemini API key.',
      )
    }
    server.middlewares.use(
      '/api/generate-quiz',
      createQuizApiProxy(
        '/api/generate-quiz',
        handleGenerateQuiz,
        providerKeys,
        allowedOrigins,
      ),
    )
    server.middlewares.use(
      '/api/translate-quiz',
      createQuizApiProxy(
        '/api/translate-quiz',
        handleTranslateQuiz,
        providerKeys,
        allowedOrigins,
      ),
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
  const providerKeys = resolveProviderKeys(env)
  const allowedOrigins = env.ALLOWED_ORIGINS

  return {
  plugins: [
    react(),
    apiProxyPlugin(providerKeys, allowedOrigins),
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
