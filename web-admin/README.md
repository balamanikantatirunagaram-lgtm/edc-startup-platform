# Web Admin — EDC Admin Panel

> Internal administration panel for the Entrepreneurship Development Cell.

---

## Project Overview

A Next.js 16 admin panel used by EDC coordinators to review startup applications, manage students, and update incubation statuses. Connects to the same Supabase backend as `edc-website` but uses the **service role key** for elevated privileges.

---

## Folder Structure

```
web-admin/
├── docs/                     ← Documentation
│   ├── architecture/
│   ├── api/
│   ├── setup/
│   ├── deployment/
│   ├── changelog/
│   ├── decisions/
│   ├── diagrams/
│   └── troubleshooting/
│
├── src/
│   ├── app/                  ← Next.js App Router
│   │   ├── (admin)/          ← Protected admin pages (overview, students, startups)
│   │   ├── (auth)/           ← Login page
│   │   ├── layout.tsx        ← Root HTML shell
│   │   ├── page.tsx          ← Redirects to /admin
│   │   └── globals.css       ← Global CSS
│   │
│   ├── components/
│   │   ├── layout/           ← AdminSidebar, AdminHeader, Brand
│   │   ├── shared/           ← ModeToggle, StatCard, StatusBadge, ThemeProvider, etc.
│   │   └── ui/               ← Low-level shadcn/Base UI primitives
│   │
│   ├── features/             ← Feature-scoped modules
│   │   ├── overview/         ← Admin dashboard stats + pending list
│   │   ├── startups/         ← Startup application management
│   │   └── students/         ← Student directory
│   │
│   ├── services/             ← Server actions
│   │   ├── admin.service.ts  ← getAllStartups, getAllStudents, updateStartupStatus
│   │   └── auth.service.ts   ← login, logout, getCurrentUser
│   │
│   ├── hooks/
│   ├── lib/                  ← app-state-context, utils
│   ├── store/                ← mock-data.ts
│   ├── middleware/           ← Route protection
│   ├── types/                ← TypeScript domain types
│   ├── constants/            ← App-wide constants
│   └── config/               ← Env config
│
├── public/
├── scripts/
├── tests/
├── configs/
├── logs/
└── temp/
```

---

## Installation

```bash
npm install
cp .env.example .env.local
# Fill in Supabase credentials (same project as edc-website)
npm run dev
```

App runs on **http://localhost:3001**

---

## Key Conventions

Same as `edc-website`. See its README for full conventions.

```ts
// ✅ Correct imports
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { getAllStartups } from '@/services/admin.service'
import { ADMIN_ROUTES } from '@/constants/app.constants'
```

---

## Security Notes

- The admin panel uses `SUPABASE_SECRET_KEY` (service role key) to access the Supabase Admin API
- **Never expose** the secret key to client-side code
- All admin database operations happen in `"use server"` functions
- Middleware protects all `/admin/*` routes — unauthenticated users are redirected to `/login`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on :3001 |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |
| `npm run clean` | Clear `.next` cache |
