import { Health } from './schema'
import { HealthRepository } from './repository'

/**
 * Use cases for the health domain
 */
export class HealthUseCases {
  constructor(private repository: HealthRepository) {}

  /**
   * Get current health status
   */
  async getHealth(): Promise<Health> {
    return this.repository.status()
  }
}
