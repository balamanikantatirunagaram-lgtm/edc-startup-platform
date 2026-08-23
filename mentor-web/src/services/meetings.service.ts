"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY || ""
  return createClient(supabaseUrl, supabaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function getSupabase(token?: string) {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  })
}

export async function getMyMeetings() {
  try {    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    const supabase = getSupabase(token)
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const supabaseAdmin = getSupabaseAdmin()

    // Mentors both SEND requests (Network page) and RECEIVE them (from team
    // leaders). Fetch both directions and tag which side we're on.
    const { data: meetings, error } = await supabaseAdmin
      .from('meeting_requests')
      .select('*, startups(name, tagline)')
      .or(`sender_id.eq.${user.user.id},receiver_id.eq.${user.user.id}`)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return {
      meetings: (meetings || []).map((m: any) => ({
        ...m,
        direction: m.sender_id === user.user.id ? 'sent' : 'received'
      }))
    }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateMeetingStatus(meetingId: string, status: 'accepted' | 'declined') {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    const supabase = getSupabase()
    if (!token) return { error: "Not authenticated" }
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const { data: meetingData } = await supabaseAdmin
      .from('meeting_requests')
      .select('sender_id, receiver_id, status')
      .eq('id', meetingId)
      .single()

    // State-machine guards: only the RECEIVER decides, and only while pending.
    if (!meetingData) return { error: "Meeting request not found." }
    if (meetingData.receiver_id !== user.user.id) return { error: "Not authorized" }
    if (meetingData.status !== 'pending') {
      return { error: `This request was already ${meetingData.status}.` }
    }

    const { error } = await supabaseAdmin
      .from('meeting_requests')
      .update({ status })
      .eq('id', meetingId)

    if (error) return { error: error.message }

    // Notify the other party (top-level title/message columns)
    const { createNotification } = require('./notification.service')
    const counterpart = meetingData?.sender_id
    if (counterpart) {
      await createNotification(counterpart, {
        title: status === 'accepted' ? 'Meeting Confirmed' : 'Meeting Declined',
        message: `Your meeting request has been ${status}.`,
        type: status === 'accepted' ? 'success' : 'info'
      })
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Mentor withdraws a still-pending request they sent
export async function cancelMeetingRequest(meetingId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    const supabase = getSupabase()
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const { data: m } = await supabaseAdmin
      .from('meeting_requests')
      .select('id, sender_id, receiver_id, status, startups(name)')
      .eq('id', meetingId)
      .single()
    if (!m) return { error: "Request not found." }
    if (m.sender_id !== user.user.id) return { error: "Not authorized" }
    if (m.status !== 'pending') return { error: "Only pending requests can be cancelled." }

    const { error } = await supabaseAdmin.from('meeting_requests').delete().eq('id', meetingId)
    if (error) return { error: "Failed to cancel." }

    try {
      const { createNotification } = require('./notification.service')
      if (m.receiver_id) {
        await createNotification(m.receiver_id, {
          title: 'Meeting Request Cancelled',
          message: `The mentor cancelled their meeting request regarding ${((m.startups as any) ? (Array.isArray(m.startups) ? m.startups[0]?.name : (m.startups as any).name) : 'a startup')}.`,
          type: 'info'
        })
      }
    } catch { /* best-effort */ }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
