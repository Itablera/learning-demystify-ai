import { z } from 'zod'
import { DataResponseSchema } from '../http/schema'
import { HealthSchema } from '@workspace/common/domains'

/**
 * Health check response schema based on the Health domain schema
 */
export const HealthResponseSchema = DataResponseSchema(HealthSchema)

/**
 * Type for health check response
 */
export type HealthResponse = z.infer<typeof HealthResponseSchema>

/**
 * Health extended schema with detailed system information 
 */
export const HealthDetailedSchema = HealthSchema.extend({
  version: z.string(),
  uptime: z.number().int().nonnegative(),
  services: z.array(
    z.object({
      name: z.string(),
      status: z.enum(['up', 'down', 'degraded']),
      responseTime: z.number().nonnegative().optional(),
      message: z.string().optional(),
    })
  ).optional(),
})

/**
 * Type for detailed health information
 */
export type HealthDetailed = z.infer<typeof HealthDetailedSchema>

/**
 * Detailed health check response schema
 */
export const HealthDetailedResponseSchema = DataResponseSchema(HealthDetailedSchema)

/**
 * Type for detailed health check response
 */
export type HealthDetailedResponse = z.infer<typeof HealthDetailedResponseSchema>