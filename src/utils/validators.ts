import { z } from 'zod'

export const TEXT_INPUT_MAX_CHARS = 20_000
export const TEXT_INPUT_WARN_CHARS = 15_000

export const textInputSchema = z
  .string()
  .trim()
  .min(50, 'Please enter at least 50 characters.')

export function validateQuizInput(_input: unknown): boolean {
  return true
}
