# Architecture

This document outlines the architectural decisions and patterns used in this project. For contribution guidelines and coding conventions, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Development Environment

- **VS Code**: Primary IDE with extensive extension support
- **Devcontainer**: Ensures consistent development environment across all systems

## Package Management

- **Turborepo**: Monorepo management for independent build and deployment
- **pnpm**: Fast, disk-space efficient package manager optimized for monorepos

## Project Structure

The project follows a monorepo architecture with `@workspace/*` package scope:

- **Domains** (`packages/domains`): Core business logic, domain models, and repository interfaces
- **Use-cases** (`packages/use-cases`): Pure business logic with dependency injection
- **Integrations** (`packages/integrations`): External service clients and adapters
- **API** (`packages/api`): API schemas and DTOs
- **Applications**:
  - `apps/api`: Backend implementation
  - `apps/web`: Frontend Next.js application
  - `apps/deepseek-r1-webgpu`: DeepSeek WebGPU demo
  - `apps/janus-pro-webgpu`: Janus Pro WebGPU demo

## Domain-Driven Design (DDD)

The project follows Domain-Driven Design principles with a clear separation of concerns:

### Domain Layer

- **Domain Models**: Core business entities defined with Zod schemas (`<Domain>Schema`)
- **Repository Interfaces**: Define data access contracts without implementation details
- **Value Objects**: Immutable objects representing domain concepts

### Application Layer

- **Use Cases**: Pure functions for business operations (named with verbs)
- **Services**: Coordinate between multiple repositories or domains

### Infrastructure Layer

- **Repository Implementations**: Concrete implementations of domain repositories
- **API Routes**: Entry points for HTTP requests
- **External Integrations**: Adapters for third-party services

## Repository Pattern

- **Interface-Implementation Separation**: Interfaces in domains, implementations in apps
- **Persistence Logic Isolation**: Repositories handle only data access, not business logic
- **Testability**: Enables easy mocking for unit testing domain logic

## Data Flow Architecture

- **Domain Schemas**: Internal representation of business entities
- **DTOs**: External representation for API communication
- **Frontend-Backend Communication**: REST API with clear contract separation

## Supporting Technologies

- **Docker**: Container management for services and development environment
- **Ollama**: Local LLM runtime environment
- **Qdrant**: Vector database for embeddings and similarity search
- **Langchain**: Framework for LLM operations and integrations

For detailed coding conventions, import patterns, and contribution guidelines, please refer to [CONTRIBUTING.md](../CONTRIBUTING.md).
