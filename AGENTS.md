# Altair — Repository Instructions

## Purpose

Altair is an AI-powered deployment reliability platform. It correlates
deployments with operational metrics, detects regressions, and produces
evidence-grounded incident investigations.

## Repository layout

- `apps/web`: Next.js UI and frontend application logic.
- `apps/api`: NestJS HTTP API and backend business modules.
- `apps/worker`: asynchronous background processing.
- `packages/database`: shared PostgreSQL and Prisma infrastructure.
- `packages/contracts`: shared external contracts.
- `packages/*`: reusable configuration and utilities.

## Tooling and commands

- Use pnpm for dependencies and workspace commands. Do not introduce another
  package manager or orchestration framework.
- Use root scripts as `pnpm <script>`.
- For a package-specific command, use `pnpm --filter <package> <script>`.
- Inspect `package.json` scripts before running unfamiliar commands.
- Run the narrowest relevant check while iterating; run broader checks before
  handoff when the changed scope warrants them.

## Architecture and boundaries

- Monorepo: Turborepo with pnpm workspaces.
- Frontend: Next.js with a feature-oriented architecture.
- Backend: NestJS modular monolith.
- Background processing runs in a separate worker process.
- Database: PostgreSQL with Prisma.
- Prefer established repository patterns over new abstractions.
- Keep business logic out of controllers.
- Respect module ownership and public interfaces.
- Do not import backend implementation into the web application.
- Do not expose database entities through public API contracts.

Consult `docs/architecture.md` before making architectural decisions. Update
documentation when architectural behavior changes.

## Engineering and security

- Keep modifications within the requested scope.
- Validate external input at trust boundaries.
- Avoid unnecessary dependencies and abstractions.
- Never commit secrets, credentials, or environment-specific configuration.
- Preserve error handling; do not silently ignore failures.

## Change workflow

1. Read the relevant code, documentation, and existing patterns.
2. Confirm the goal, constraints, and acceptance criteria. Ask when ambiguity
   would materially change the implementation.
3. Plan before implementing complex, multi-step, or cross-boundary work.
4. Implement the smallest change that satisfies the acceptance criteria.
5. Add or update automated tests for changed business logic; mock external
   dependencies.
6. Run relevant verification commands.
7. Review the final diff for regressions, risky patterns, boundary violations,
   secret exposure, and unintended changes.
8. Report the changes, checks actually run and their results, plus remaining
   risks or unrun checks.

## Definition of done

Work is complete only when:

- the requested behavior and acceptance criteria are satisfied;
- relevant tests are added or updated and pass;
- relevant lint, typecheck, build, and test commands have been run, or any
  unrun checks are explicitly identified with the reason;
- the final diff has been reviewed for regressions, boundary violations,
  unsafe input handling, and secret exposure;
- architectural documentation is updated when behavior or decisions change; and
- the handoff reports changes, verification results, and remaining risks.

## Verification and review

When relevant to the changed packages, run:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

**Do not report an unexecuted check as successful.**

During review, flag:

- repository-boundary violations;
- database entities exposed through public contracts;
- missing trust-boundary validation or unsafe secret handling; and
- changed business logic without relevant automated tests.