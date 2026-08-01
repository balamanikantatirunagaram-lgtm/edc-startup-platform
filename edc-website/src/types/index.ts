/**
 * @file index.ts
 * @purpose Shared TypeScript type definitions for the EDC Website application
 * @responsibility Centralises all domain types used across components, services, and store
 * @lastModified 2026-07-31
 */

// ─── User & Auth ────────────────────────────────────────────────────────────

export interface IUser {
  id: string
  niatId: string
  fullName: string
  email: string
  phone?: string
  department?: string
  academicYear?: string
  linkedin?: string
  github?: string
  portfolio?: string
  collegeId?: string
  avatarUrl?: string
  bio?: string
  profileCompletion?: number
  role?: UserRole
  is_admin?: boolean
}

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  MENTOR = 'mentor',
}

// ─── Startup ─────────────────────────────────────────────────────────────────

export type StartupStatus =
  | 'pending'
  | 'Submitted'
  | 'Under Review'
  | 'Needs Improvement'
  | 'Approved'
  | 'Incubation Ready'

export interface IStartup {
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
  team_id?: string
  teams?: { name: string; leader_id: string }
  history?: IStatusHistoryEntry[]
  created_at?: string
}

export interface IStatusHistoryEntry {
  status: StartupStatus
  date: string
  reviewer?: string
  feedback?: string
  nextSteps?: string
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType = 'approved' | 'changes' | 'feedback' | 'info' | 'warning'

export interface INotification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export interface IActivityLog {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface IApiResponse<T = void> {
  success?: boolean
  data?: T
  error?: string
}
