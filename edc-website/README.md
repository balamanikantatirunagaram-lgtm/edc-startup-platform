# EDC Website — Student Portal

> Student-facing incubation portal for the Entrepreneurship Development Cell.

---

## Project Overview

A Next.js 16 application using the App Router, Supabase for backend, Tailwind CSS v4 for styling, and shadcn/ui (via Base UI) for components.

---

## Folder Structure

```
edc-website/
├── docs/                     ← Documentation (you are here)
│   ├── architecture/         ← System design decisions
│   ├── api/                  ← Service/action API reference
│   ├── setup/                ← Installation and dev setup
│   ├── deployment/           ← Deployment guides
│   ├── changelog/            ← Version history
│   ├── decisions/            ← Architecture Decision Records (ADRs)
│   ├── diagrams/             ← System diagrams
│   └── troubleshooting/      ← Known issues and solutions
│
├── src/
│   ├── app/                  ← Next.js App Router (pages and layouts)
│   │   ├── (app)/            ← Protected student pages
│   │   ├── (auth)/           ← Authentication pages
│   │   ├── onboarding/       ← Profile completion flow
│   │   ├── api/              ← API route handlers
│   │   ├── layout.tsx        ← Root HTML shell
│   │   ├── page.tsx          ← Root redirect
│   │   └── globals.css       ← Global CSS and Tailwind tokens
│   │
│   ├── components/
│   │   ├── layout/           ← AppSidebar, AppHeader, Brand
│   │   ├── shared/           ← ChatBot, ModeToggle, StatusBadge, etc.
│   │   └── ui/               ← Low-level shadcn/Base UI primitives
│   │
│   ├── features/             ← Feature-scoped components and logic
│   │   ├── dashboard/
│   │   ├── startup/
│   │   ├── team/
│   │   ├── mentors/
│   │   ├── funding/
│   │   ├── events/
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── settings/
│   │
│   ├── services/             ← Next.js server actions (was app/actions/)
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── startup.service.ts
│   │   ├── team.service.ts
│   │   ├── notifications.service.ts
│   │   ├── profile.service.ts
│   │   └── tasks.service.ts
│   │
│   ├── hooks/                ← Custom React hooks (use-mobile, etc.)
│   ├── lib/                  ← Core utilities and React context
│   ├── store/                ← App state seed (mock-data.ts)
│   ├── middleware/           ← Route protection middleware
│   ├── types/                ← TypeScript domain types
│   ├── constants/            ← UPPER_SNAKE_CASE app constants
│   ├── config/               ← Env vars and app configuration
│   └── styles/               ← Additional global styles
│
├── public/                   ← Static files served at /
├── scripts/                  ← Data seeding and DB setup scripts
├── tests/                    ← Jest / Playwright test suites
├── configs/                  ← Additional tool configs
├── logs/                     ← Runtime logs (gitignored)
└── temp/                     ← Temporary scratch files (gitignored)
```

---

## Installation

```bash
npm install
cp .env.example .env.local
# Fill in Supabase credentials
npm run dev
```

App runs on **http://localhost:3000**

---

## Key Conventions

### Imports — use `@/` alias (resolves to `src/`)

```ts
// ✅ Correct
import { AppSidebar } from '@/components/layout/AppSidebar'
import { login } from '@/services/auth.service'
import { ROUTES } from '@/constants/app.constants'

// ❌ Avoid relative imports between features
import { something } from '../../../components/...'
```

### Components
- `PascalCase` filenames for React components
- `camelCase` for utilities and services
- `kebab-case` for CSS classes
- Each component exports a single named export

### Services (Server Actions)
- All live in `src/services/`
- Named `*.service.ts`
- Must have `"use server"` directive at top
- Return `{ success, data }` or `{ error }` shape

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Anon key for client-side |
| `SUPABASE_SECRET_KEY` | Service role key for server-side admin ops |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |
| `npm run clean` | Clear `.next` cache |
