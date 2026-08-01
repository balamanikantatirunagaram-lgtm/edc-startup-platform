# EDC Startup Management Platform — Monorepo

> **Entrepreneurship Development Cell** · Student Incubation Portal + Admin Panel

---

## Project Overview

This monorepo contains two standalone Next.js 16 applications that together power the EDC startup management ecosystem:

| App | Directory | URL | Purpose |
|-----|-----------|-----|---------|
| **EDC Website** | `edc-website/` | `localhost:3000` | Student-facing portal for startup registration, team management, and progress tracking |
| **Web Admin** | `web-admin/` | `localhost:3001` | Internal admin panel for reviewing applications and managing students |

Both apps share the same **Supabase** backend but are independently deployable.

---

## Architecture

```
tartup-management-platform/            ← Monorepo root
├── edc-website/                       ← Student portal (Next.js 16)
│   ├── docs/                          ← Documentation
│   ├── src/                           ← All source code (src/ layout)
│   │   ├── app/                       ← Next.js App Router
│   │   ├── components/                ← UI components
│   │   ├── features/                  ← Feature modules
│   │   ├── services/                  ← Server actions / API calls
│   │   ├── hooks/                     ← Custom React hooks
│   │   ├── lib/                       ← Core utilities and context
│   │   ├── store/                     ← State seed / mock data
│   │   ├── types/                     ← TypeScript definitions
│   │   ├── constants/                 ← App-wide constants
│   │   ├── config/                    ← Environment and app config
│   │   ├── middleware/                ← Request middleware
│   │   └── styles/                    ← Global stylesheets
│   ├── public/                        ← Static assets
│   ├── scripts/                       ← Build and data scripts
│   └── tests/                         ← Test suites
│
├── web-admin/                         ← Admin panel (Next.js 16)
│   └── ... (identical structure)
│
└── README.md                          ← This file
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9 (or npm/yarn)
- A Supabase project

### 1 — Install dependencies

```bash
# Student portal
cd edc-website && npm install

# Admin panel
cd ../web-admin && npm install
```

### 2 — Set up environment

```bash
# In edc-website/
cp .env.example .env.local
# Fill in your Supabase credentials

# In web-admin/
cp .env.example .env.local
# Same Supabase project, same credentials
```

### 3 — Run development servers

```bash
# Terminal 1 — Student portal on :3000
cd edc-website && npm run dev

# Terminal 2 — Admin panel on :3001
cd web-admin && npm run dev
```

---

## Applications

### `edc-website` — Student Portal

The primary public-facing application. Students can:
- Register and log in using their NIAT ID
- Register their startup and submit for incubation
- Form and manage their team
- Track application status in real time
- Connect with mentors and browse resources
- View events and funding opportunities

**Entry point:** `src/app/layout.tsx`  
**Route groups:**
- `(auth)/` — login, first-login, forgot/reset password
- `(app)/` — protected student pages
- `onboarding/` — profile completion flow

### `web-admin` — Admin Panel

Internal administration tool. Admins can:
- View a dashboard of all students and startups
- Review and update startup application statuses
- Search and filter the student directory
- Switch to the student view for testing

**Entry point:** `src/app/layout.tsx`  
**Route groups:**
- `(auth)/` — admin login
- `(admin)/` — protected admin pages

---

## Shared Backend

Both apps connect to the **same Supabase project**:

| Resource | Used by |
|---------|---------|
| `auth.users` | Both (auth flows) |
| `startups` table | Both (students submit; admins review) |
| `teams` table | edc-website |
| Supabase Admin API | web-admin (list users, update status) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm run clean` | Delete `.next` cache |

---

## Deployment

See individual app docs:
- [`edc-website/docs/deployment/`](./edc-website/docs/deployment/)
- [`web-admin/docs/deployment/`](./web-admin/docs/deployment/)

Both apps are Vercel-compatible. Deploy them as separate projects pointing to the same Supabase instance.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | ✅ | Anon/public key |
| `SUPABASE_SECRET_KEY` | ✅ | Service role key (server-only) |

> ⚠️ **Never commit `.env.local`**. Use `.env.example` as a template.

---

## License

Private — EDC Cell Internal Tool
