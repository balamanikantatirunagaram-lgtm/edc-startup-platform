"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || ""

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export interface MentorProfile {
  id: string
  name: string
  role: string
  company: string
  expertise: string[]
  image: string | null
  availability: string | null
}

/**
 * Mentors authenticate as auth.users (role='mentor' in user_metadata), while
 * the public `mentors` table is a marketing/profile table keyed by its own UUIDs.
 * Cross-portal flows (mentorship requests, messaging) MUST use the auth id so
 * mentor-web can match them. This helper returns the merged directory.
 */
const PER_PAGE = 500

async function buildMentorDirectory(): Promise<MentorProfile[]> {
  const supabaseAdmin = getSupabaseAdmin()

  // 1. Profile extras from the public mentors table, keyed by username
  const { data: profiles } = await supabaseAdmin.from('mentors').select('*')
  const byUsername = new Map<string, any>()
  for (const p of profiles || []) {
    const key = String(p.username || p.name || '').toLowerCase().replace(/\s+/g, '')
    if (key) byUsername.set(key, p)
  }

  // 2. Auth users flagged as mentors (these ids are the cross-portal identity)
  const result: MentorProfile[] = []
  let page = 1
  for (;;) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: PER_PAGE })
    const users = data?.users || []
    if (users.length === 0) break
    for (const u of users) {
      const meta = (u.user_metadata || {}) as any
      if (meta.role !== 'mentor') continue
      const usernameKey = String(meta.username || meta.name || '').toLowerCase().replace(/\s+/g, '')
      const profile = byUsername.get(usernameKey)
      result.push({
        id: u.id,
        name: meta.name || meta.username || u.email?.split('@')[0] || 'Mentor',
        role: profile?.role || meta.title || 'Mentor',
        company: profile?.company || meta.company || '',
        expertise: Array.isArray(profile?.expertise) ? profile.expertise : (Array.isArray(meta.expertise) ? meta.expertise : []),
        image: profile?.image || meta.avatarUrl || null,
        availability: profile?.availability || null,
      })
    }
    if (users.length < PER_PAGE) break
    page++
  }

  return result
}

/** Directory for the student-facing mentors page (ids are auth ids). */
export async function getMentorDirectory() {
  try {
    return { mentors: await buildMentorDirectory() }
  } catch (err: any) {
    console.error('getMentorDirectory error:', err)
    return { mentors: [] }
  }
}

/**
 * Resolve mentor display info for arbitrary ids. New flows store auth ids;
 * legacy rows may still reference public.mentors UUIDs — fall back there.
 * Also resolves sender names in message threads (a mentor may be the sender).
 */
export async function resolveMentorProfiles(ids: string[]): Promise<Record<string, Partial<MentorProfile> & { name: string }>> {
  const out: Record<string, { name: string } & Partial<MentorProfile>> = {}
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (unique.length === 0) return out

  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Auth-side lookup (paginate once through users — fine at campus scale)
    let page = 1
    for (;;) {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: PER_PAGE })
      const users = data?.users || []
      if (users.length === 0) break
      for (const u of users) {
        if (!unique.includes(u.id)) continue
        const meta = (u.user_metadata || {}) as any
        out[u.id] = {
          id: u.id,
          name: meta.name || meta.username || u.email?.split('@')[0] || 'Mentor',
          role: meta.title || '',
          company: meta.company || '',
          expertise: [],
          image: meta.avatarUrl || null,
          availability: null,
        }
      }
      if (users.length < PER_PAGE) break
      page++
    }

    // Fallback for legacy marketing-table ids not yet remapped
    const missing = unique.filter(id => !out[id])
    if (missing.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('mentors')
        .select('id, name, role, company, image')
        .in('id', missing)
      for (const p of profiles || []) {
        out[p.id] = { id: p.id, name: p.name, role: p.role || '', company: p.company || '', expertise: [], image: p.image || null, availability: null }
      }
    }
  } catch (err) {
    console.error('resolveMentorProfiles error:', err)
  }

  return out
}
