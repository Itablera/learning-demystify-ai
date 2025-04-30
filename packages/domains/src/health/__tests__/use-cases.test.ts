import { describe, it, expect, beforeEach } from 'vitest'
import { MockHealthRepository } from './mock-repository'

describe('HealthUseCases', () => {
  let repository: MockHealthRepository

  beforeEach(() => {
    repository = new MockHealthRepository()
  })

  it('should perform a health check', async () => {
    const health = await repository.status()
    expect(health).toEqual({
      status: 'ok',
    })
  })
})
