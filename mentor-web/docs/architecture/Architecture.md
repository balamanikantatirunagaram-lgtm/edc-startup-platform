# Architecture — EDC Website

## System Overview

```
Browser (Student)
    │
    ▼
Next.js 16 App Router (edc-website)
    │
    ├── (auth)/ ──────────────── Public routes: login, forgot-password
    ├── (app)/  ──────────────── Protected routes: dashboard, startup, team...
    └── onboarding/ ──────────── Profile setup (protected)
          │
          ├── src/services/ ──── Server Actions ("use server")
          │       └── Supabase Client (anon key)
          │
          └── src/lib/app-state-context.tsx
                  └── Client-side global state (React Context)
```

## Data Flow

1. **User logs in** → `auth.service.ts` → Supabase Auth → cookie set
2. **Middleware reads cookie** → allows or redirects
3. **Page loads** → Server Actions fetch from Supabase → return to client
4. **Client state** → `AppStateProvider` stores user/startup/notification state
5. **Mutations** → Server Actions update Supabase → client state resynced

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js Server Actions | No separate API layer needed for this scale |
| React Context (not Redux) | Simple enough state; avoid over-engineering |
| Cookie-based auth | Works with Next.js middleware for SSR redirects |
| `src/` directory | Keeps project root clean; industry standard |
| Separate services/ from app/ | Services are portable; pages are framework-coupled |

## Component Hierarchy

```
RootLayout (app/layout.tsx)
└── ThemeProvider + AppStateProvider + TooltipProvider
    └── (app)/layout.tsx
        └── SidebarProvider
            ├── AppSidebar
            ├── SidebarInset
            │   ├── AppHeader
            │   └── [page content]
            └── ChatBot
```
