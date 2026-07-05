// Edge handler: Gemini-primary quiz generation with Groq fallback.
import { handleGenerateQuiz } from './lib/handleGenerateQuiz'

export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  return handleGenerateQuiz(request, {
    geminiApiKey: process.env.GEMINI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
  })
}
