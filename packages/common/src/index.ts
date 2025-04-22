// Export all types from the submodules
export * from './domains'

// Export types from './types' while avoiding name conflicts
// This prevents the "has already exported a member named X" TypeScript errors
export type { 
  // Re-export everything as types except the conflicting ones
  // Omit the types that are causing conflicts: FieldValue, FieldValueSchema
} from './types'

// Selectively re-export non-type values from types
// (excluding calculateTotalCost which is already exported from domains)
import * as TypeExports from './types'
export const {
  // List here any specific constants or functions you need from './types'
  // except for calculateTotalCost  
} = TypeExports