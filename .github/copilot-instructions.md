# GitHub Copilot Project Instructions

This project uses a modern full-stack monorepo setup with the following stack and conventions. These guidelines are tailored to assist AI tools like GitHub Copilot in generating consistent, maintainable, and type-safe code.

## General Setup

- **Monorepo** managed using **Turborepo**
- **Package manager**: `pnpm`
- **Domain Driven Design** (DDD) approach
  - All shared logic (types, Zod schemas, interfaces, domain contracts) lives in `packages/common/src/domains`
  - Types are located in `packages/common/src/types`

## Frontend

- Framework: **Next.js v15** (App Router)
- Styling: **Tailwind CSS v4**
- UI components: **shadcn/ui**
- TypeScript is used throughout
- Follows modern React best practices

## Backend

- Server framework: **Fastify** 
- Use **langchain** as a library for building LLM applications

### Backend Folder Structure

Each **domain** has its own folder under `apps/backend/src/domains`, mirroring the structure in `packages/common/src/domains`.

Example:
```
apps/api/src/domains/chat/
  routes.ts         # Fastify routes
  repository.ts     # Repository implementation
```

- Shared Zod schemas, TypeScript types, and repository interfaces are defined in `packages/common/src/domains`
- Backend-specific logic (database, langchain operations, etc.) implements those interfaces and orchestrates domain operations. These implementations are located in `apps/backend/src/domains` 
- API specific Zod schemas and TypeScript types, eg. DTOs, and request and response schemas are defined in `packages/api/src/domains` and are used in the Fastify routes

## Domains and Types Overview

- Domains are defined per business concept (e.g., account, user, chat, etc.)
- Each domain includes `schema.ts`, `repository.ts`, and `use-cases.ts`
- Each domain has a sub folder for test called `__tests__`, containing `use-cases.test.ts` and `mock-repository.ts`
- Shared enums, IDs, and utility types live under `packages/common/src/types`

## Code Style

- Use **single quotes**
- **No semicolons**
- Favor explicit, readable, and composable code
- Write modular logic in small functions where appropriate

## Suggestions for GitHub Copilot

- Always import shared schemas, types, and interfaces from `packages/common` using alias `@workspace/common/domain` and `@workspace/common/types`
- Use `@workspace/common` for shared logic
- Suggest functions that reflect the repository pattern (e.g., `findById`, `findPaginated`, `createOne`)
- Use `zod` schemas from `@workspace/common` for validation and type inference
- When writing API routes, prefer using domain-scoped files like `apps/backend/src/user/routes.ts`
- Use aliases like `@/app` or `@/components` in frontend when resolving imports
- Maintain consistent naming: e.g., `createDocumentService`, `DocumentSchema`, `DocumentRepository`, etc.
