/**
 * @file app.constants.ts
 * @purpose Application-wide constants for web-admin
 * @responsibility Centralises magic strings and route paths
 * @lastModified 2026-07-31
 */

// ─── Routes ──────────────────────────────────────────────────────────────────
export const ADMIN_ROUTES = {
  ROOT: '/admin',
  STUDENTS: '/admin/students',
  STARTUPS: '/admin/startups',
  STARTUP_REVIEW: (id: string) => `/admin/startups/${id}`,
  LOGIN: '/login',
  STUDENT_VIEW: '/dashboard',
} as const

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_COOKIE_NAME = 'sb-access-token'
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
export const EMAIL_DOMAIN = '@student.tartup.local'

// ─── Startup Statuses ─────────────────────────────────────────────────────────
export const STARTUP_STATUSES = [
  'pending',
  'Submitted',
  'Under Review',
  'Needs Improvement',
  'Approved',
  'Incubation Ready',
] as const

export const REVIEWABLE_STATUSES = [
  'Under Review',
  'Needs Improvement',
  'Approved',
  'Incubation Ready',
] as const
