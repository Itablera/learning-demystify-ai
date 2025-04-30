import { z } from 'zod'

/**
 * Base HTTP response schema for all API responses
 */
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  timestamp: z.string().datetime(),
})

/**
 * Type for the base HTTP response
 */
export type BaseResponse = z.infer<typeof BaseResponseSchema>

/**
 * Generic data response schema with strongly typed data
 */
export const DataResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  BaseResponseSchema.extend({
    data: dataSchema,
  })

/**
 * Type for the data response with generic data type
 */
export type DataResponse<T> = BaseResponse & {
  data: T
}

/**
 * Error response schema with optional error details
 */
export const ErrorResponseSchema = BaseResponseSchema.extend({
  error: z
    .object({
      code: z.string(),
      details: z.any().optional(),
    })
    .optional(),
})

/**
 * Type for the error response
 */
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

/**
 * Pagination parameters schema for paginated requests
 */
export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

/**
 * Type for pagination parameters
 */
export type PaginationParams = z.infer<typeof PaginationParamsSchema>

/**
 * Pagination metadata schema for paginated responses
 */
export const PaginationMetaSchema = z.object({
  totalItems: z.number().int().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  itemsPerPage: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
})

/**
 * Type for pagination metadata
 */
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>

/**
 * Paginated response schema with strongly typed items
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemsSchema: T) =>
  BaseResponseSchema.extend({
    data: z.object({
      items: z.array(itemsSchema),
      meta: PaginationMetaSchema,
    }),
  })

/**
 * Type for paginated response with generic item type
 */
export type PaginatedResponse<T> = BaseResponse & {
  data: {
    items: T[]
    meta: PaginationMeta
  }
}
