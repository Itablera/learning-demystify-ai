# Demystify AI - AKA. Crash and Burn

## How to run

> [!NOTE]
> Always use `pnpm` and not `npm`. This repo has copies/references to other repos. So even if some app instructs you to use `npm`, please use `pnpm` instead.

As we are using Turborepo, you can install and run everything from the root of the repo. However, feel free to explore the individual apps and packages as well (there should be a readme file for each app).

1. In project root, run `pnpm install` to install all dependencies
2. Run something!
   1. Janus demo - `pnpm run dev:janus`
   2. DeepSeek demo - `pnpm run dev:deepseek`
   3. The API - `pnpm run dev:api`
   4. The web - `pnpm run dev:web`
   5. Fullstack - `pnpm run dev`
3. Open a Chrome based browser and go to `http://localhost:5180` (or whatever port is used)

> [!NOTE]
> Some apps require a `.env` file, often there is a `.env.example` file in the app folder. Copy it to `.env` and fill in the required values.

## Development Guidelines

Please review [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed information on:

- Code organization and folder structure
- Naming conventions
- Import patterns and package boundaries
- Architecture guidelines

## Documentation

For more information about the architecture, tools, and references:

- [Architecture Documentation](./docs/architecture.md)
- [VS Code Setup](./docs/vs-code.md)
- [External References](./docs/references.md)
