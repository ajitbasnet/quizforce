import { handleGenerateQuiz } from './lib/handleGenerateQuiz'

export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  return handleGenerateQuiz(request, {
    apiKey: process.env.ANTHROPIC_API_KEY,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
  })
}
