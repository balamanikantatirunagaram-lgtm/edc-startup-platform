/**
 * @file app.constants.ts
 * @purpose Application-wide constants for edc-website
 * @responsibility Centralises magic strings, route paths, and configuration values
 * @lastModified 2026-07-31
 */

// ─── Routes ──────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FIRST_LOGIN: '/first-login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  STARTUP: '/startup',
  STARTUP_REGISTER: '/startup/register',
  TEAM: '/team',
  MENTORS: '/mentors',
  RESOURCES: '/resources',
  FUNDING: '/funding',
  EVENTS: '/events',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  USER: 'edc_user',
  STARTUP: 'edc_startup',
  NOTIFICATIONS: 'edc_notifications',
  STUDENTS: 'edc_students',
  STARTUPS: 'edc_startups',
  LOGS: 'edc_logs',
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

// ─── Profile ──────────────────────────────────────────────────────────────────
export const PROFILE_TOTAL_FIELDS = 8
