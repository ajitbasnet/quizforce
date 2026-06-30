import { describe, expect, it } from 'vitest'
import { getLocalUserId } from '../utils/localUserId'

describe('getLocalUserId', () => {
  it('creates and persists a user id', () => {
    const id = getLocalUserId()
    expect(id).toBeTruthy()
    expect(getLocalUserId()).toBe(id)
  })
})
