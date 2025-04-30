import { Health } from '../schema'
import { HealthRepository } from '../repository'

/**
 * In-memory implementation of HealthRepository for testing
 */
export class MockHealthRepository implements HealthRepository {
  private health: Health = {
    status: 'ok',
  }

  constructor() {}

  async status(): Promise<Health> {
    return this.health
  }

  async setStatus(status: Health): Promise<void> {
    this.health = status
  }
}
