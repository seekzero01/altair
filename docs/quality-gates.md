# Quality gates

Use Node.js 24 and the pnpm version pinned in the root `packageManager` field.

| Component             | Command                          | Scope                                                                  |
| --------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| Dependency validation | `pnpm install --frozen-lockfile` | All workspaces; fails on manifest/lockfile drift                       |
| Lint                  | `pnpm lint`                      | Repository-wide Oxlint, zero warnings allowed                          |
| Formatting            | `pnpm format`                    | Repository-wide Oxfmt check                                            |
| Type checking         | `pnpm typecheck`                 | API and web; `tsc --noEmit`                                            |
| Unit tests            | `pnpm test`                      | API controller/service and web page tests, with V8 coverage            |
| Integration tests     | `pnpm test:integration`          | API HTTP route, controller, service, and module wiring                 |
| Build                 | `pnpm build`                     | NestJS and Next.js production builds                                   |
| Security              | `pnpm audit`                     | Production, development, and package-manager dependencies              |
| Task orchestration    | `pnpm verify`                    | Turbo runs lint, format, typecheck, unit/integration tests, and builds |

Dependency validation and auditing run separately from `pnpm verify`.
An audit finding fails the security gate; there are no advisory exemptions.

Oxlint disables nested configuration discovery so dependency template configs
cannot bypass root exclusions. Correctness violations, debugger statements,
and explicit `any` types are errors. Web overrides support the automatic JSX
runtime, CSS side-effect imports, Hooks, Next.js, and accessibility checks.
API overrides permit empty decorated NestJS module classes.
Type-aware linting is not enabled; compiler checks run separately.

Oxfmt uses two-space indentation, double quotes, semicolons, and LF endings.
Package field order is preserved. Generated output, the lockfile, and agent
instruction files are excluded. `pnpm lint:fix` and `pnpm format:fix` modify
files. Turbo fix tasks are uncached, with formatting after lint fixes.

Applications use their package-local TypeScript versions and strict configs.
Use `pnpm --filter web typecheck` or `pnpm --filter api typecheck` for one app.
The web task generates Next.js route types before checking.
The shared TypeScript config package is available but is not yet inherited.

Unit coverage requires at least 80% statements, branches, functions, and lines.
API coverage includes service business logic; controller behavior is verified
by unit and HTTP integration tests. Web coverage currently includes the starter
page. Expand coverage includes as new business modules and components are added.
Integration tests mock external telemetry and close the HTTP application.

Turbo caches lint, formatting, typechecks, unit coverage, and build artifacts.
Integration tests always execute. `API_URL` participates in the build cache key.
CI supplies a non-secret localhost `API_URL` for rewrite validation.
The Next.js build downloads Google Fonts and requires network access; Tailwind
processing also requires permission to create a local IPC listener.

GitHub Actions runs every gate on pushes and pull requests. The aggregate
`Quality Gates` job fails if any prerequisite fails or is skipped. Configure
this check as required in the target branch's GitHub ruleset or branch
protection settings to block merges. Workflow files alone do not enforce
branch protection; remote CI execution must be verified after pushing.
