## Repo structure

```
.
├── apps/                   - Applications that will run and possible consume packages
│   ├── janus-pro-webgpu    - Run Janus LLM fully locally using webgpu
│   ├── deepseek-r1-webgpu  - Run DeepSeek LLM fully locally using webgpu
│   ├── app2
│   └── app3
├── packages/               - Shared packages and data that will be used by applications
│   ├── package1
│   ├── package2
│   └── package3
├── infra/                  - Configuration and infrastructure scripts
│   ├── Ollama              - Instructions on how to run LLMs locally
│   ├── Qdrant              - Manages vector embeddings for similarity search
│   └── Agent0              - Instructions on how to run agent-zero locally
└── docs                    - Documentation and notes
```


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