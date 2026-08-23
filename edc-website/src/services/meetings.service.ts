"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  return createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_PUBLISHABLE_KEY || "", {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function getSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return null
  const supabase = getSupabase()
  const { data: user } = await supabase.auth.getUser(token)
  return user.user
}

export interface MeetingRequestView {
  id: string
  mentorId: string
  mentorName: string
  message: string
  meetingTime: string | null
  status: string
  createdAt: string
}

// Incoming meeting requests for the logged-in TEAM LEADER
export async function getMyMeetingRequests() {
  try {
    const user = await getSessionUser()
    if (!user) return { requests: [] }

    const supabaseAdmin = getSupabaseAdmin()

    // Leader's team
    const { data: member } = await supabaseAdmin
      .from('team_members')
      .select('team_id, teams(leader_id)')
      .eq('student_id', user.id)
      .eq('status', 'approved')
      .limit(1).maybeSingle()
    if (!member || !member.team_id) return { requests: [] }

    const isLeader = (member.teams as any)?.leader_id === user.id
    if (!isLeader) return { requests: [] }

    const { data: rows, error } = await supabaseAdmin
      .from('meeting_requests')
      .select('id, sender_id, message, meeting_time, status, created_at, startups(name)')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }

    const mentorIds = Array.from(new Set((rows || []).map(r => r.sender_id)))
    const nameById = new Map<string, string>()
    if (mentorIds.length > 0) {
      try {
        let page = 1
        for (;;) {
          const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 500 })
          const users = data?.users || []
          if (users.length === 0) break
          for (const u of users) {
            if (mentorIds.includes(u.id)) {
              const meta = (u.user_metadata || {}) as any
              nameById.set(u.id, meta.name || meta.username || u.email?.split('@')[0] || 'Mentor')
            }
          }
          if (users.length < 500) break
          page++
        }
      } catch { /* fall back to generic names */ }
    }

    return {
      requests: (rows || []).map(r => ({
        id: r.id,
        mentorId: r.sender_id,
        mentorName: nameById.get(r.sender_id) || 'Mentor',
        message: r.message || '',
        meetingTime: r.meeting_time,
        status: r.status,
        createdAt: r.created_at
      })) as MeetingRequestView[]
    }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Leader accepts/declines an incoming meeting request -> notifies the mentor
export async function respondToMeetingRequest(meetingId: string, decision: 'accepted' | 'declined') {
  try {
    const user = await getSessionUser()
    if (!user) return { error: "Not authenticated" }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: m } = await supabaseAdmin
      .from('meeting_requests')
      .select('id, sender_id, receiver_id, status, meeting_time')
      .eq('id', meetingId)
      .single()
    if (!m) return { error: "Request not found." }
    if (m.receiver_id !== user.id) return { error: "Not authorized" }
    if (m.status !== 'pending') return { error: `This request was already ${m.status}.` }

    const { error } = await supabaseAdmin
      .from('meeting_requests')
      .update({ status: decision })
      .eq('id', meetingId)
    if (error) return { error: "Failed to update." }

    // Notify the mentor of the outcome
    try {
      const { data: profile } = await supabaseAdmin
        .from('students').select('name, niat_id').eq('id', user.id).single()
      const who = profile?.name || profile?.niat_id || 'The team'
      const timeStr = m.meeting_time ? new Date(m.meeting_time).toLocaleString() : ''
      const { createNotification } = require('./notifications.service')
      await createNotification(
        m.sender_id,
        decision === 'accepted' ? 'Meeting Confirmed' : 'Meeting Declined',
        decision === 'accepted'
          ? `${who} accepted your meeting request${timeStr ? ` for ${timeStr}` : ''}.`
          : `${who} declined your meeting request.`,
        decision === 'accepted' ? 'success' : 'info'
      )
    } catch { /* best-effort */ }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
