// Edge handler: Gemini-primary quiz translation with Groq fallback.
import { handleTranslateQuiz } from './lib/handleTranslateQuiz'

export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  return handleTranslateQuiz(request, {
    geminiApiKey: process.env.GEMINI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
  })
}
