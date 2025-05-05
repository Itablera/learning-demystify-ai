# GitHub Copilot Agent Instructions

## Project Architecture

- **Monorepo** (Turborepo + pnpm) with `@workspace/*` package scope
- **Domain-Driven Design (DDD)** with Repository Pattern
- **Key packages**:
  - `domains`: Domain types, schemas, repository interfaces
  - `use-cases`: Pure business logic with dependency injection
  - `integrations`: External service clients
  - `api`: API schemas (DTOs)
  - `apps/api`: Backend implementation
  - `apps/frontend`: Frontend code

## Code Guidelines

- **Use-cases**: Pure functions, no infrastructure dependencies
- **Repositories**: Abstract persistence, implemented per app
- **Integrations**: Encapsulate external services (not persistence)

## Testing

- Place tests in `__tests__` directory, use Vitest
- Create separate mock files for repositories and services
- Test happy paths, edge cases, and error conditions
- Use proper type safety with optional chaining (`?.`)

## Imports

- Relative imports within packages
- Package aliases (`@workspace/domains`) for cross-package imports
- `@/` alias for app-local imports

## Style

- Pure functions for use-cases, classes for stateful components
- Single quotes, no semicolons, `const`/`let`, async/await
- Small, focused files with composable logic
