# Altair — Repository Instructions

## Project
Altair is an AI-powered deployment reliability platform.
It correlates deployments with operational metrics,
detects regressions, and produces evidence-grounded
incident investigations.

## Architecture
- Monorepo: Turborepo + pnpm workspaces.
- Frontend: Next.js, feature-oriented architecture.
- Backend: NestJS, modular monolith.
- Background processing: separate worker process.
- Database: PostgreSQL + Prisma.
- Prefer existing patterns over new abstractions.

## Repository boundaries
- apps/web: UI and frontend application logic.
- apps/api: HTTP API and backend business modules.
- apps/worker: asynchronous background processing.
- packages/database: shared database infrastructure.
- packages/contracts: shared external contracts.
- packages/*: reusable configuration and utilities.

## Engineering rules
- Keep business logic out of controllers.
- Respect module ownership and public interfaces.
- Do not import backend implementation into web.
- Do not expose database entities as public API contracts.
- Validate external input at trust boundaries.
- Avoid unnecessary dependencies and abstractions.
- Never commit secrets or credentials.

## Development workflow
1. Read relevant documentation and existing code.
2. Understand the task and acceptance criteria.
3. Plan changes before implementing complex features.
4. Keep modifications within the requested scope.
5. Add or update appropriate automated tests.
6. Run relevant verification commands.
7. Report changes, verification results, and risks.

## Verification
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

Run checks relevant to the changed packages.
Do not report unexecuted checks as successful.

## Documentation
Consult docs/architecture.md for architectural decisions.
Update documentation when architectural behavior changes.