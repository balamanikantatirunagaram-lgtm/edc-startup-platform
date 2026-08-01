/**
 * @file env.config.ts
 * @purpose Typed environment variable access for edc-website
 * @responsibility Centralises and validates all env vars in one place
 * @lastModified 2026-07-31
 */

export const ENV = {
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY ?? '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const
