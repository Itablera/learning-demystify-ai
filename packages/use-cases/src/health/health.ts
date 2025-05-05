// filepath: /Users/perlinde/repositories/learning-demystify-ai/packages/use-cases/src/health/health.ts
import { Health, HealthRepository } from '@workspace/domains/src/health'

/**
 * Get current health status
 */
export async function getHealth(repository: HealthRepository): Promise<Health> {
  return repository.status()
}
