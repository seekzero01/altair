# Quality gates

Run `pnpm lint` to check the repository with Oxlint.
Run `pnpm lint:fix` to apply safe fixes and report remaining violations.
Run `pnpm exec turbo run lint` to use Turbo's root-task cache.

Correctness rules, debugger statements, and explicit `any` types are errors.
Web files additionally enable React Hooks, Next.js, and accessibility rules.
Generated output and Next.js declaration files are ignored.

The built-in Next.js rules are Oxlint implementations, not eslint-config-next.
Compiler diagnostics remain the responsibility of `pnpm typecheck`;
type-aware linting is not enabled.

The CI lint job runs `pnpm lint` and `pnpm format`. All CI jobs select pnpm
from the repository's `packageManager` field to keep local and CI versions aligned.

Run `pnpm format` to check formatting without changing files.
Run `pnpm format:fix` to write formatting changes.
Run `pnpm exec turbo run format` to use Turbo's root-task cache.

Oxfmt uses two-space indentation, single quotes, semicolons, and LF endings.
Import sorting is disabled; package.json field order is preserved.
Generated files, pnpm's lockfile, and agent instruction files are excluded.

The Turbo `format:fix` task is uncached and runs after `lint:fix` to avoid
concurrent edits. Direct `pnpm format:fix` only formats files.

Run `pnpm typecheck` to check all applications with TypeScript 7.0.2.
Use `pnpm --filter @altair/web typecheck` (or `@altair/api`, `@altair/worker`)
for a single application.

All applications inherit strict settings from `packages/typescript-config`.
Type checking uses the released native `typescript` compiler through `tsc --noEmit`.
The web task generates Next.js route types before checking; Turbo caches those
types and the incremental compiler state. Dependency typecheck tasks run first,
so changes to shared packages invalidate consuming applications.
