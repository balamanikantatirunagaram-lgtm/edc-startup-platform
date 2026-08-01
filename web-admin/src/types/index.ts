/**
 * @file index.ts
 * @purpose Shared TypeScript type definitions for the web-admin application
 * @responsibility Centralises all domain types used across admin components and services
 * @lastModified 2026-07-31
 */

// Re-export shared types
export type StartupStatus =
  | 'pending'
  | 'Submitted'
  | 'Under Review'
  | 'Needs Improvement'
  | 'Approved'
  | 'Incubation Ready'

export interface IAdminStartup {
  id: string
  name: string
  tagline?: string
  problem_statement?: string
  proposed_solution?: string
  industry?: string
  category?: string
  stage?: string
  status: StartupStatus
  leader_id?: string
  teams?: { name: string; leader_id: string }
}

export interface IAdminStudent {
  id: string
  email?: string
  name: string
  niatId: string
  department?: string
  academicYear?: string
  isSuspended?: boolean
}

export interface IAdminStats {
  totalStudents: number
  totalStartups: number
  pendingReviews: number
}

export interface IApiResponse<T = void> {
  success?: boolean
  data?: T
  error?: string
}
