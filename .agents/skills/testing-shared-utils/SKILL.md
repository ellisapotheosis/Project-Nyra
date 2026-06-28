---
name: testing-shared-utils
description: Test @nyra/shared utilities end-to-end. Use when verifying shared logger, error classes, API types, CRM proxy, graceful shutdown, or service re-exports after changes to packages/shared.
---

# Testing @nyra/shared Utilities

## Overview

`packages/shared` (`@nyra/shared`) contains zero-dependency shared utilities used across all Nyra services. Testing is shell-based (no GUI needed) since these are library modules.

## Devin Secrets Needed

None — these are pure TypeScript utilities with no external service dependencies.

## Prerequisites

- `tsx` must be available for running TypeScript test scripts. Install with `pnpm add -D tsx -w` if missing.
- The existing smoke suite (`pnpm test`) runs 86+ tests via vitest and covers import resolution across the monorepo.

## What to Test

### 1. Smoke Suite (always run first)
```bash
pnpm test
```
Expect: All tests pass. If any fail, an import path is likely broken.

### 2. Logger (`packages/shared/src/logger.ts`)
Key behaviors to verify:
- `createLogger("svc").info("msg", { key: "val" })` outputs valid NDJSON to **stdout**
- `log.error("msg", new Error("x"))` outputs to **stderr** with `error` and `stack` fields (not `{ meta: {} }`)
- `log.child({ requestId: "abc" })` inherits parent service name and merges context
- `LOG_LEVEL=warn` suppresses `info`/`debug` messages
- Capture output by temporarily replacing `process.stdout.write` / `process.stderr.write`

### 3. Error Classes (`packages/shared/src/errors.ts`)
Verify each class has correct `statusCode`, `type`, and default `message`:
- `BadRequestError` → 400, `invalid_request_error`
- `UnauthorizedError` → 401, `authentication_error`
- `ForbiddenError` → 403, `permission_error`
- `NotFoundError` → 404, `not_found_error`
- `RateLimitError` → 429, `rate_limit_error`
- `ServerError` → 500, `server_error`
- All must be `instanceof HttpError` and `instanceof Error`

### 4. API Response Helpers (`packages/shared/src/api-types.ts`)
- `apiSuccess({ id: 1 }, "ok")` → `{ success: true, data: { id: 1 }, message: "ok", timestamp: <ISO> }`
- `apiError("bad", "nope")` → `{ success: false, error: "bad", message: "nope", timestamp: <ISO> }`
- Verify no extra fields leak in

### 5. CRM Proxy (`packages/shared/src/crm-proxy.ts`)
- Without `CRM_API_URL` set: `crmProxy("/api/leads")` returns `{ ok: false }` without throwing
- Testing with a live CRM requires `CRM_API_URL` and `CRM_API_KEY` env vars

### 6. Graceful Shutdown (`packages/shared/src/graceful-shutdown.ts`)
- Register multiple handlers via `onShutdown()`, simulate SIGTERM
- Verify all handlers run in registration order
- Verify only one SIGTERM listener is registered (not one per handler)
- Must mock `process.exit` to prevent test process from terminating

### 7. Import Resolution
- Barrel import: `import { createLogger, HttpError, crmProxy } from "@nyra/shared"` (or relative path to `packages/shared/src/index.ts`)
- Sub-path import: `import { crmProxy } from "@nyra/shared/crm-proxy"` (Next.js routes use this to avoid express type dependency)
- Service re-exports: each service's `src/utils/logger.ts` re-exports from `@nyra/shared`

## Gotchas

- **tsx not globally installed**: The repo might not have `tsx` as a dependency. Use `pnpm add -D tsx -w` to add it as a workspace dev dependency.
- **Logger meta wrapping**: The letta-integration `LoggerCompat` class previously wrapped meta in `{ meta }`, which defeated `normalizeMeta`'s Error detection. If this pattern reappears, Error objects will serialize as `{}` in logs.
- **Express type leakage**: The barrel `index.ts` re-exports `errorHandler`/`asyncHandler` from `express-errors.ts`, which imports Express types. Non-Express consumers (Next.js) should use sub-path imports like `@nyra/shared/crm-proxy` to avoid needing `@types/express`.
- **Graceful shutdown module state**: The `cleanups` array and `registered` flag are module-level singletons. If running multiple shutdown tests in the same process, the state persists across tests.
- **LOG_LEVEL is read at logger creation time**: Changing the env var after `createLogger()` won't affect existing loggers.
- **CI failures**: Cloudflare Pages, CircleCI lint/typecheck, and validate-compose checks might fail on PRs — these are often pre-existing on main. Always verify against the base branch before investigating.

## Test Script Location

Test scripts can be placed in `tests/test-shared-utils.ts` and `tests/test-graceful-shutdown.ts`. Run with:
```bash
npx tsx tests/test-shared-utils.ts
npx tsx tests/test-graceful-shutdown.ts
```
