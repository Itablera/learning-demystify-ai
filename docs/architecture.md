## Repo structure

```
.
├── apps/                      - Applications that will run and possible consume packages
│   ├── deepseek-r1-webgpu     - Demo application to run DeepSeek on WebGPU
│   ├── janus-pro-webgpu       - Demo application for Janus Pro on WebGPU
│   ├── api                    - All backend stuff
│   └── web                    - Frontend web application
├── packages/                  - Shared packages and data that will be used by applications
│   └── common                 - Common code and utilities shared across applications
├── infra/                     - Configuration and infrastructure scripts
│   ├── ollama                 - Instructions on how to run LLMs locally
│   ├── qdrant                 - Manages vector embeddings for similarity search
│   └── agent0                 - Instructions on how to run agent-zero locally
├── reference-repos/           - External repos added as sub-modules for convenience 
└── docs                       - Documentation and notes


## Architecture and Tooling

### Development Environment
- **VS Code**: The main IDE used for development. Lightweight with a large ecosystem of extensions.
- **Devcontainer**: Provides a consistent development environment for all developers, ensuring uniform tools and versions across systems.

### Package Management
- **Turborepo**: Manages the monorepo, enabling independent build and deployment of applications and packages.
- **pnpm**: A fast and efficient package manager, well-suited for monorepos.

### Application Design
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