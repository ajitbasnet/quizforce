import type { Quiz } from './quiz'

export interface RegenerateState {
  sourceType: Quiz['sourceType']
  sourceContent: string
}
