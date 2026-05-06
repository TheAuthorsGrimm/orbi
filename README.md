# 🔮 Orbi — ADHD Productivity Companion
### by GrimmForged AI Solutions

> *Built for the ADHD brain. Not around it.*

---

## What is Orbi?

Orbi is an AI-powered productivity companion designed specifically for people with ADHD.
Unlike generic task managers, Orbi understands executive dysfunction, dopamine-driven motivation,
and the unique way ADHD brains work — and works *with* that, not against it.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | React 18 + Vite + TypeScript |
| Desktop | Tauri v2 + React (shared frontend) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| AI | Anthropic Claude (claude-sonnet-4) |
| Auth | JWT (custom) |
| Billing | Stripe (CAD) |
| Integrations | Google Calendar, Gmail |
| Testing | Playwright E2E |
| Monorepo | pnpm workspaces |

---

## Subscription Tiers

| Tier | Price | Features |
|---|---|---|
| **Free** | $0 CAD | Task Planner, Calendar, 5 active tasks |
| **Orbi Agent** | $9.99 CAD/mo | + AI Agent (Claude), proactive check-ins, unlimited tasks |
| **Orbi Full** | $24.99 CAD/mo | + Smart Reminders, Tailored Persona, Google Calendar, Gmail, Insights |

---

## Project Structure

```
orbi/
├── apps/
│   ├── web/              # React + Vite web app
│   └── desktop/          # Tauri desktop app
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared component library (for Copilot)
│   └── api-client/       # Typed API client
├── backend/
│   └── src/
│       ├── config/       # DB connection, env
│       ├── controllers/  # Route handlers
│       ├── integrations/ # Google Calendar, Gmail
│       ├── middleware/   # Auth, tier-gating, error handling
│       ├── models/       # MongoDB/Mongoose models
│       ├── routes/       # Express routers
│       └── services/     # Orbi AI agent, Stripe billing
├── tests/
│   └── e2e/              # Playwright test scenarios
├── .env.example
├── package.json          # pnpm workspace root
├── playwright.config.ts
└── pnpm-workspace.yaml
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTS                          │
│  ┌──────────────┐        ┌──────────────────────┐  │
│  │  Web App     │        │  Desktop App (Tauri)  │  │
│  │  React+Vite  │        │  React (shared UI)    │  │
│  └──────┬───────┘        └──────────┬────────────┘  │
└─────────┼────────────────────────────┼───────────────┘
          │ HTTP / REST                │ HTTP / REST
          ▼                            ▼
┌─────────────────────────────────────────────────────┐
│              ORBI BACKEND (Express)                 │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │   Auth   │  │  Tasks   │  │  AI Agent Chat  │  │
│  │  /login  │  │  /tasks  │  │  /chat          │  │
│  └──────────┘  └──────────┘  └────────┬────────┘  │
│                                        │            │
│  ┌──────────┐  ┌──────────┐  ┌────────▼────────┐  │
│  │  Focus   │  │Reminders │  │  Anthropic API  │  │
│  │ Sessions │  │ /remind  │  │  Claude Sonnet  │  │
│  └──────────┘  └──────────┘  └─────────────────┘  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │ Calendar │  │  Stripe  │  │  Tier Gating    │  │
│  │ /gcal    │  │ Billing  │  │  Middleware     │  │
│  └────┬─────┘  └────┬─────┘  └─────────────────┘  │
└───────┼─────────────┼──────────────────────────────┘
        │             │
        ▼             ▼
┌───────────┐  ┌──────────────┐
│  Google   │  │  MongoDB     │
│  Calendar │  │  Atlas       │
│  Gmail    │  │  (orbi db)   │
└───────────┘  └──────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- MongoDB Atlas account (free tier works)
- Anthropic API key
- Stripe account (for billing)
- Google Cloud project (for Calendar/Gmail, Full tier only)

### Setup

```bash
# Clone and install
git clone https://github.com/grimmforged/orbi
cd orbi
pnpm install

# Configure environment
cp .env.example backend/.env
# Fill in your values in backend/.env

# Run development (web + backend)
pnpm dev

# Run desktop
pnpm dev:desktop

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui
```

---

## UI/UX Notes for Copilot Agents

The UI should embody the Orbi design principles:
- **Orbital metaphor** — tasks orbit around a central focus node
- **Dopamine-aware** — every completion should feel rewarding (animation, sound, colour)
- **Low cognitive load** — never more than one decision at a time
- **Dark by default** — easier on ADHD/sensory-sensitive users
- **GrimmForged aesthetic** — industrial/forge-inspired, cyberpunk accents, deep purples/teals

Component library lives in `packages/ui/` — build all shared components there
so both web and desktop use identical UI.

---

## Playwright Tests

Tests are organized by tier and cover:
- Auth flows (register, login, logout)
- Free tier: planner, calendar, task limits, upgrade prompts
- Agent tier: AI chat, task decomposition, focus sessions
- Full tier: persona customization, reminders, calendar sync
- Subscription: pricing display, upgrade flow, Stripe redirect

Run: `pnpm test`
UI Mode: `pnpm test:ui`

---

*Built with ❤️ and hyperfocus by GrimmForged*
