import { Health } from './schema'

export interface HealthRepository {
  /**
   * Health status
   */
  status(): Promise<Health>
}