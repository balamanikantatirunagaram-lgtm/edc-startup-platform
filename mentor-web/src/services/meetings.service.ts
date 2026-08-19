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
    
    // We are getting meetings where user is requester
    // Also, if the user is a startup member, we'd get meetings for their startup,
    // but for simplicity, we get where requester_id is this user.
    const { data: meetings, error } = await supabaseAdmin
      .from('meeting_requests')
      .select('*, startups(name, tagline)')
      .eq('sender_id', user.user.id)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { meetings }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateMeetingStatus(meetingId: string, status: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const { data: meetingData } = await supabaseAdmin
      .from('meeting_requests')
      .select('sender_id')
      .eq('id', meetingId)
      .single()
      
    const { error } = await supabaseAdmin
      .from('meeting_requests')
      .update({ status })
      .eq('id', meetingId)

    if (error) return { error: error.message }
    
    // Notify the sender
    if (meetingData?.sender_id) {
      const { createNotification } = require('./notification.service')
      await createNotification(meetingData.sender_id, `meeting_${status}`, {
        message: `Your meeting request has been ${status}.`
      })
    }
    
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
