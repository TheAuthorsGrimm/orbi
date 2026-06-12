# Orbi Agent Guide

Use this file as the fast path for working in this repository. Keep it minimal, prefer the owning package's scripts and source tree, and follow linked docs instead of copying them.

## Workspace Shape

- This is a `pnpm` workspace defined in [pnpm-workspace.yaml](pnpm-workspace.yaml).
- The main runnable web app is [apps/web](apps/web), not the top-level [src](src) tree.
- The backend API is [backend](backend).
- Desktop has two separate surfaces:
  - [apps/windows](apps/windows) is the Electron Windows app.
  - [apps/desktop](apps/desktop) is the Tauri desktop app.
- Mobile work should target [apps/iphone](apps/iphone). Do not start from [apps/iphone_scaffold](apps/iphone_scaffold) unless the task is explicitly about the scaffold.
- Shared packages live under [packages](packages):
  - [packages/types](packages/types)
  - [packages/api-client](packages/api-client)
  - [packages/ui](packages/ui)
  - [packages/design-system](packages/design-system)

## Start In The Right Place

- For browser product work, start in [apps/web/src](apps/web/src).
- For API or auth work, start in [backend/src](backend/src).
- For Windows packaging or Electron-specific behavior, start in [apps/windows](apps/windows).
- If a task mentions the top-level [src](src) app, confirm that it is intentional before editing it; this repo contains a parallel React tree there.

## Commands That Reflect Current Reality

Run commands from the workspace root unless the task is package-specific.

### Root

- `pnpm install`
- `pnpm dev:web`
- `pnpm dev:backend`
- `pnpm test`
- `pnpm test:ui`

### Focused Validation

- Web typecheck: `pnpm --filter @orbi/web typecheck`
- Backend typecheck: `pnpm --filter @orbi/backend typecheck`
- Web build: `pnpm --filter @orbi/web build`
- Backend build: `pnpm --filter @orbi/backend build`
- Windows typecheck: `pnpm --filter @orbi/windows type-check`
- Windows build: `pnpm --filter @orbi/windows build`

## Testing Notes

- Playwright is configured in [playwright.config.ts](playwright.config.ts) and auto-starts the backend and web app.
- `pnpm test` expects the web app at `http://localhost:5173` and the backend health endpoint at `http://localhost:3001/health`.
- In a fresh environment, Playwright may need a one-time browser install: `pnpm exec playwright install chromium`.

## Known Repo Pitfalls

- The top-level [README.md](README.md) and [ARCHITECTURE.md](ARCHITECTURE.md) are useful orientation docs, but some details are aspirational or stale. If a doc conflicts with package scripts or source layout, trust the local package manifest and entrypoint.
- There is no root `pnpm dev` script even though some docs imply a combined dev command.
- [apps/windows](apps/windows) and [apps/desktop](apps/desktop) are different desktop implementations; do not treat them as interchangeable.
- [apps/iphone_scaffold](apps/iphone_scaffold) is a scaffold, not the primary mobile app.
- Current E2E friction: the login Playwright flow and the rendered login form are not fully aligned, so selector failures may be test drift rather than app startup failure.

## Useful Anchors

- Web entry: [apps/web/src/main.tsx](apps/web/src/main.tsx)
- Backend entry: [backend/src/server.ts](backend/src/server.ts)
- Example controller surface: [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts)
- E2E coverage: [tests/e2e/orbi.spec.ts](tests/e2e/orbi.spec.ts)

## Reference Docs

- Product and stack overview: [README.md](README.md)
- Platform layout and design system notes: [ARCHITECTURE.md](ARCHITECTURE.md)
- Windows-specific notes: [apps/windows/README.md](apps/windows/README.md)
- iPhone app notes: [apps/iphone/README.md](apps/iphone/README.md)
