# GitHub Copilot Project Instructions

This file contains concise instructions tailored for GitHub Copilot to generate consistent, maintainable, and type-safe code.

## Core Structure and Folder Layout

- Monorepo managed using Turborepo  
- Package manager: `pnpm`  
- Domains live under `packages/common/src/domains` (core logic) and `apps/api/src/domains` (backend implementation)  
- Shared utility types and enums live in `packages/common/src/types`  
- Backend-specific implementations (e.g., repositories, routes) are in `apps/api/src/domains` 

## Architectural Guidelines

The codebase follows Domain-Driven Design (DDD) principles and the Repository Pattern. Each domain encapsulates its own schema, use-cases, and repository interface. Repository implementations are kept separate from domain logic, under `apps/api/src/domains/[domain]/repository.ts`. Repositories should not contain business logic—only persistence-related behavior. Use-cases coordinate business operations and may call repositories, services, or workflows.

## Schema vs DTO Distinction

- Core domain schemas and types are defined in `@workspace/do-common`  
- API-facing DTO schemas (request/response shapes) are defined in `@workspace/do-api`  

## Package and Import Conventions

- **Inside packages** (e.g., `packages/common`, `packages/api`):  
  - **Always use relative imports** (e.g., `./foo`, `../bar`) for files within the same package boundary.  
  - **Never use aliases like `@/`, `@workspace/do-common` or `@workspace/do-api`** for intra-package imports.  
  - **Only use `@workspace/do-common` or `@workspace/do-api`** when importing *across* packages.

- **Inside apps** (e.g., `apps/api`, `apps/frontend`):  
  - **Use the `@/` alias** (e.g., `@/domains/user/routes`) for internal imports within the same app.
  - **Use package imports** (e.g., `@workspace/do-common`) for shared logic or types.

- **Never use relative imports that cross domain or package boundaries.**

### Examples

#### Correct relative imports inside a package:
```ts
// In packages/common/src/domains/user/index.ts
import { UserSchema } from './schema'
import { validateUser } from '../utils/validateUser'
```

#### Correct cross-package imports:
```ts
// In apps/api/src/domains/user/create.ts
import { UserSchema } from '@workspace/do-common'
import { CreateUserRequestSchema } from '@workspace/do-api'
```

#### Correct "@/..." alias usage inside an app:
```ts
// In apps/frontend/src/components/UserProfile.tsx
import { fetchUser } from '@/lib/api'
import { UserAvatar } from '@/components/UserAvatar'
```

## Naming Conventions

- Schemas: `<Domain>Schema` (e.g., `UserSchema`)  
- Use-cases: functions named with verbs (e.g., `createUser`, `updateProduct`)  
- Repositories: `<Domain>Repository` (e.g., `UserRepository`)  
- Routes: domain-scoped files like `apps/api/src/domains/user/routes.ts`  

## Code Style Hints

- Use single quotes  
- No semicolons  
- Favor explicit, readable, and composable code  
- Write modular logic in small functions where appropriate
