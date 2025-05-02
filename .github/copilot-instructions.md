# GitHub Copilot Agent Instructions

This file provides concise, AI-optimized instructions to guide GitHub Copilot Agent mode in generating consistent, maintainable, and type-safe code.

## Project Overview

- **Monorepo** managed with **Turborepo** and **pnpm**.
- **Package scope**: `@workspace/*`

### Core Package Roles

| Package                 | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `packages/domains`      | Domain types, schemas, and repository interfaces |
| `packages/use-cases`    | Pure, dependency-injected business logic         |
| `packages/integrations` | External service clients (e.g., OpenAI, Qdrant)  |
| `packages/api`          | DTO schemas for API input/output                 |
| `apps/api`              | Backend routes and concrete repository impls     |
| `apps/frontend`         | Frontend code                                    |

## Architectural Guidelines

- Follows **Domain-Driven Design (DDD)** and the **Repository Pattern**.
- Use-cases are **pure**, infrastructure-agnostic functions.
- Repositories abstract **domain persistence** and are implemented per app.
- Integrations encapsulate **external service logic** (not persistence).

## Folder Layout

```bash
/packages
  /domains/src/[domain]/{schema.ts, repository.ts}
  /use-cases/[useCase].ts
  /integrations/[client].ts
  /api/src/[domain]/schema.ts

/apps/api/src
  /domains/[domain]/{routes.ts, repository.ts}
  /integrations/[client].ts
```

## Import Rules

- Use relative imports for files within the same package.
- Use package aliases (e.g. @workspace/domains) only for cross-package imports.
- In apps, use @/ for app-local imports (e.g. @/domains/user/routes).
- Never use relative paths across package boundaries.

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

- Schemas: UserSchema, InvoiceSchema
- DTOs: CreateUserRequest, UserResponse
- Repositories: UserRepository (interface), MongoUserRepository (impl)
- Use-cases: assignLicenseToUser()
- Integrations: OpenAIClient, QdrantVectorStoreClient

## Function and Class Usage

- Use pure named functions for all use-cases
- Use factory functions to inject dependencies if many
- Use classes only for stateful or config-bound logic (repos, integrations)
- Avoid class-based use-cases
- Use arrow functions for inline logic and callbacks

## Code Style Hints

- Use single quotes
- No semicolons
- Use const/let (not var)
- Prefer async/await over .then()
- Favor composable, modular logic in small files
