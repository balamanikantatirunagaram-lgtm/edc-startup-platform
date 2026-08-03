# Changelog — EDC Website

## v1.1.0 — 2026-07-31

### Changed
- Separated admin panel into standalone `web-admin/` application
- Migrated all source files into `src/` directory structure
- Moved `app/actions/*` → `src/services/*.service.ts`
- Moved `components/app-sidebar` → `src/components/layout/AppSidebar`
- Moved `components/app-header` → `src/components/layout/AppHeader`
- Moved `components/brand` → `src/components/layout/Brand`
- Moved all shared components → `src/components/shared/`
- Moved `lib/mock-data.ts` → `src/store/mock-data.ts`
- Moved `middleware.ts` → `src/middleware.ts`
- Updated all `@/` import aliases to resolve from `src/`
- Added `src/types/index.ts` — centralised domain types
- Added `src/constants/app.constants.ts` — eliminated magic strings
- Added `src/config/env.config.ts` — typed env variable access

### Added
- `docs/` directory with architecture, setup, and changelog documentation
- `.env.example` template
- Granular tsconfig path aliases (`@components/*`, `@services/*`, etc.)

## v1.0.0 — Initial release

- Combined Next.js app with both student portal and admin panel
