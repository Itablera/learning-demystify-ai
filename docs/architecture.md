```
.
├── apps/                      - Applications that will run and possibly consume packages
│   ├── deepseek-r1-webgpu     - Demo application to run DeepSeek on WebGPU
│   ├── janus-pro-webgpu       - Demo application for Janus Pro on WebGPU
│   ├── api                    - All backend stuff
│   └── web                    - Frontend web application
├── packages/                  - Shared packages and data that will be used by applications
│   ├── domains                - Core logic and domain-specific code
│   ├── types                  - Shared utility types and enums
│   └── api                    - API-facing DTO schemas and utilities
├── infra/                     - Configuration and infrastructure scripts
│   ├── ollama                 - Instructions on how to run LLMs locally
│   ├── qdrant                 - Manages vector embeddings for similarity search
│   └── agent0                 - Instructions on how to run agent-zero locally
├── reference-repos/           - External repos added as sub-modules for convenience
└── docs                       - Documentation and notes
```

## Architecture and Tooling

### Development Environment

- **VS Code**: The main IDE used for development. Lightweight with a large ecosystem of extensions.
- **Devcontainer**: Provides a consistent development environment for all developers, ensuring uniform tools and versions across systems.

### Package Management

- **Turborepo**: Manages the monorepo, enabling independent build and deployment of applications and packages.
- **pnpm**: A fast and efficient package manager, well-suited for monorepos.

### Application Design

#### Domain-Driven Design (DDD) Principles

The project follows Domain-Driven Design principles, with a clear separation of concerns:

- **Domain Layer** (`packages/domains`): Contains core business logic, domain models, and repository interfaces

  - **Schema**: Domain models defined using Zod for validation (`<Domain>Schema`)
  - **Repository Interface**: Defines the contract for data access operations without implementation details
  - **Use Cases**: Pure functions that encapsulate business operations (named with verbs like `createUser`)

- **Application Layer** (`apps/api`): Implements infrastructure concerns
  - **Repository Implementations**: Concrete implementations of repository interfaces
  - **Routes**: API endpoints that use domain logic to handle requests
  - **Controllers**: Coordinate between routes and use-cases

#### Repository Pattern

- **Interface-Implementation Separation**: Repository interfaces are defined in domain packages, implementations in apps
- **Persistence Logic Isolation**: Repositories contain only data access code, not business logic
- **Testing Friendly**: Facilitates mocking repositories for unit testing domain logic

#### Schema vs DTO Distinction

- **Domain Schemas** (`@workspace/domains`): Internal representation of domain entities
- **API DTOs** (`@workspace/api`): External representation for API requests/responses

### Frontend/Backend Separation

- **Backend/Frontend Separation**: Backend handles business logic and data processing, while frontend focuses on user interface and experience.
- **REST API**: Backend exposes a REST API for frontend consumption, enabling decoupled development and technology flexibility.
- **Next.js**: A React framework for building the frontend.
  - Why not Angular?
    - Well, mostly because we will play with V0 to get a frontend up and running quickly. V0 prefer React over Angular...
    - And finally, the frontend is not the main focus of this project.

### Tools and Technologies

- **Docker**: Manages dependent services (e.g., Qdrant, Ollama) and hosts the devcontainer.
- **Ollama**: Runs LLMs locally, eliminating the need for cloud providers and supporting diverse models.
- **Qdrant**: Stores and manages vector embeddings for similarity search and related operations.
- **Langchain**: Manages LLMs and data processing, facilitating easy switching between models and techniques.

## Coding Conventions

### Import Patterns

- **Inside packages**: Use relative imports within package boundaries
- **Inside apps**: Use `@/` alias for app imports, package imports for external dependencies
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed examples

### Naming Conventions

- **Schemas**: `<Domain>Schema` (e.g., `UserSchema`)
- **Use Cases**: Verb-based functions (e.g., `createUser`, `updateProduct`)
- **Repositories**: `<Domain>Repository` (e.g., `UserRepository`)
- **Routes**: Domain-scoped files (e.g., `apps/api/src/domains/user/routes.ts`)
