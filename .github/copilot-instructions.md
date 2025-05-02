# GitHub Copilot Project Instructions

This file contains concise instructions tailored for GitHub Copilot to generate consistent, maintainable, and type-safe code.

## Core Structure and Folder Layout

- Monorepo managed using Turborepo
- Package manager: `pnpm`
- Core domain models, types, and schemas live in `packages/domains`
- Use-cases are defined in `packages/use-cases` and are pure (no infrastructure logic)
- External system logic (e.g., Qdrant, OpenAI) lives in `packages/integrations`
- DTOs live in `packages/api`
- Domains live under `packages/domains/src` (core logic) and `apps/api/src/domains` (backend implementation)
- Shared utility types and enums live in `packages/types/src`
- Backend-specific implementations (e.g., repositories, routes) are in `apps/api/src/domains`

## Architectural Guidelines

The codebase follows Domain-Driven Design (DDD) principles and the Repository Pattern. Each domain encapsulates its own schema, use-cases, and repository interface. Repository implementations are kept separate from domain logic, under `apps/api/src/domains/[domain]/repository.ts`. Repositories should not contain business logic—only persistence-related behavior. Use-cases coordinate business operations and may call repositories, workflows, or integrations.

## Schema vs DTO Distinction

- Core domain schemas and types are defined in `@workspace/domains`
- Use-cases are defined in `@workspace/use-cases`
- API-facing DTO schemas (request/response shapes) are defined in `@workspace/api`
- External system logic is defined in `@workspace/integrations`

## Package and Import Conventions

- Use **relative imports** for all intra-package imports
- Use **package aliases** (e.g., `@workspace/domains`, `@workspace/api`, `@workspace/use-cases`, `@workspace/integrations`) only when importing across packages
- Inside apps (e.g., `apps/api`, `apps/frontend`):
  - Use the `@/` alias (e.g., `@/domains/user/routes`) for internal imports within the same app
  - Use package aliases (e.g., `@workspace/domains`) for importing from shared packages
- Never use relative imports that cross domain or package boundaries

### Examples

#### Example: Relative imports inside a domain package

```ts
// In packages/domains/src/user/index.ts
import { UserSchema } from './schema'
import { validateUser } from '../utils/validateUser'
```

#### Example: Importing from packages into an app

```ts
// In apps/api/src/domains/user/create.ts
import { UserSchema } from '@workspace/domains'
import { CreateUserRequestSchema } from '@workspace/api'
import { CreateUserUseCase } from '@workspace/use-cases'
```

#### Example: Using the @/ alias inside an app

```ts
// In apps/frontend/src/components/UserProfile.tsx
import { fetchUser } from '@/lib/api'
import { UserAvatar } from '@/components/UserAvatar'
```

## Naming Conventions

- Schemas: `<Domain>Schema` (e.g., `UserSchema`)
- Use-cases: Class with methods named with verbs (e.g., `createUser`, `updateProduct`)
- Repositories: `<Domain>Repository` (e.g., `UserRepository`)
- Routes: domain-scoped files like `apps/api/src/domains/user/routes.ts`

## Code Style Hints

- Use single quotes
- No semicolons
- Favor explicit, readable, and composable code
- Write modular logic in small functions where appropriate
- Use pure named functions for use-cases
- Use factory functions to inject dependencies if many are needed
- Use classes only for stateful behavior (e.g., repositories, integrations)
- Avoid classes for use-cases
- Use arrow functions for inline and callback logic
