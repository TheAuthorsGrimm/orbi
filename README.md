# Orbi — ADHD productivity companion

Next.js 15 (App Router) + Drizzle + Neon Postgres + Stripe + Anthropic. Deploys on Vercel.

## Architecture

- `src/app/` — Next.js App Router. The root page mounts the SPA; `src/app/api/*` are the backend routes.
- `src/spa/` — React SPA (lifted from the old Vite frontend). Uses React Router's hash router so it doesn't fight Next.js routing.
- `src/lib/` — backend code: DB client, auth (JWT in httpOnly cookie via `jose`), Stripe.
- `src/styles/` — Tailwind v4 + theme.
- `drizzle/` — committed migrations. Applied at deploy time via `pnpm db:migrate`.

## Local dev

```sh
cp .env.example .env.local
# Fill in DATABASE_URL, AUTH_SECRET, ANTHROPIC_API_KEY at minimum

pnpm install
pnpm db:migrate
pnpm dev
```

Open http://localhost:3000.

## Required env vars

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com |
| `STRIPE_PRICE_AGENT` | Stripe → Products → your $9.99/mo product → price ID |
| `STRIPE_PRICE_FULL` | Stripe → Products → your $24.99/mo product → price ID |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → endpoint signing secret |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL, e.g. `https://grimmforged.ca` |

## Deploy (Vercel)

1. Connect this repo to Vercel.
2. Add the env vars above under Project Settings → Environment Variables.
3. After first deploy, set `NEXT_PUBLIC_APP_URL` to the live URL and redeploy.
4. Configure the Stripe webhook to point at `https://<your-domain>/api/stripe/webhook`, copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

The build runs `pnpm db:migrate` is **not** automatic — run it manually once after the first deploy (`pnpm db:migrate` locally with prod `DATABASE_URL` works, or `npx drizzle-kit push`).

## API surface

Health: `GET /api/health`
Auth:   `POST /api/auth/{login,register,logout}`, `GET /api/auth/me`
Tasks:  `GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/[id]`
Chat:   `GET/POST /api/chat/sessions`, `GET /api/chat/sessions/[id]`, `POST /api/chat`
Stripe: `POST /api/stripe/{checkout,portal}`, `POST /api/stripe/webhook`

All responses use `{ success: boolean, data?, error? }`. Mongo-style `_id` is aliased to the UUID id for compatibility with the existing SPA.
