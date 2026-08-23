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

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getMyMeetings() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
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

    const { data: meetingData } = await supabaseAdmin
      .from('meeting_requests')
      .select('sender_id, receiver_id')
      .eq('id', meetingId)
      .single()

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
