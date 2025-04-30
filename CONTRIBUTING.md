# Contributing Guide

Welcome to the Learning Demystify AI monorepo! This guide explains architecture decisions, folder structure, naming conventions, and how to contribute safely.

---

## 📦 Project Overview

| Package                   | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `@workspace/domains`      | Shared types, domain logic, Zod schemas, use-cases      |
| `@workspace/api`          | API-layer DTOs (request/response shapes)                |
| `@workspace/types`        | Shared utility types and enums                          |
| `apps/api`                | Fastify routes, controllers, repository implementations |
| `apps/web`                | Next.js frontend application                            |
| `apps/deepseek-r1-webgpu` | Demo application to run DeepSeek on WebGPU              |
| `apps/janus-pro-webgpu`   | Demo application for Janus Pro on WebGPU                |

---

## 🧱 Folder Structure Conventions

Domains follow a folder-based structure:

```
packages/domains/src/[domain]/
├── schema.ts            # Domain model and validation schemas
├── repository.ts        # Repository interface (implementation in apps/api)
├── use-cases.ts         # Pure, reusable business logic
└── index.ts             # Public exports
```

Backend implementations are organized as:

```
apps/api/src/domains/[domain]/
├── repository.ts        # Concrete repository implementation
├── routes.ts            # API routes and controllers
└── index.ts             # Public exports
```

---

## 🧠 Key Concepts

### Domain Schemas

- Defined in `packages/domains/src/[domain]/schema.ts`
- Used for domain models and validation
- Follow naming convention: `<Domain>Schema` (e.g., `UserSchema`)

### DTOs

- Only live in `packages/api`
- Represent request/response shapes, separate from domain model

### Use-cases

- Represent business operations (e.g., createUser, updateProduct)
- Should be pure functions, reusable from routes or workflows
- Functions named with verbs (e.g., `createUser`, `updateProduct`)

### Repositories

- Interface defined in domain package
- Implementation in apps/api
- Follow naming convention: `<Domain>Repository` (e.g., `UserRepository`)
- Should not contain business logic—only persistence-related behavior

---

## 📤 Import Conventions

### Inside packages

- **Always use relative imports** (e.g., `./foo`, `../bar`) for files within the same package boundary
- **Never use aliases** like `@/`, `@workspace/domains` or `@workspace/api` for intra-package imports
- **Only use package imports** (e.g., `@workspace/domains`) when importing from one package to another

### Inside apps

- **Use the `@/` alias** (e.g., `@/domains/user/routes`) for internal imports within the same app
- **Use package imports** (e.g., `@workspace/domains`) for importing from shared packages

### Examples

```ts
// In packages/domains/src/user/index.ts
import { UserSchema } from './schema'
import { validateUser } from '../utils/validateUser'

// In apps/api/src/domains/user/create.ts
import { UserSchema } from '@workspace/domains'
import { CreateUserRequestSchema } from '@workspace/api'

// In apps/web/components/UserProfile.tsx
import { fetchUser } from '@/lib/api'
import { UserAvatar } from '@/components/UserAvatar'
```

---

## 🚫 Anti-patterns

❌ Domain logic in `apps/api`  
❌ Relative imports between packages  
❌ Business logic inside API routes
❌ Aliases like `@/` inside packages

---

## ✅ Code Style Guidelines

- Use single quotes
- No semicolons
- Favor explicit, readable, and composable code
- Write modular logic in small functions where appropriate

---

Happy contributing!
