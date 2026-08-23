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

export async function getNetworkStartups() {
  try {
    const supabase = getSupabaseAdmin()
    const { data: startups, error } = await supabase
      .from('startups')
      .select('id, name, tagline, problem_statement, proposed_solution, status, pitch_deck_url, website_url')

    if (error) return { error: error.message }
    return { startups }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getBookmarks() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: bookmarks, error } = await supabaseAdmin
      .from('startup_bookmarks')
      .select('startup_id')
      .eq('user_id', user.user.id)

    if (error) return { error: error.message }
    return { bookmarks: bookmarks.map(b => b.startup_id) }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleBookmark(startupId: string, isBookmarked: boolean) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const supabaseAdmin = getSupabaseAdmin()

    if (isBookmarked) {
      // Add bookmark
      const { error } = await supabaseAdmin
        .from('startup_bookmarks')
        .insert({ user_id: user.user.id, startup_id: startupId })
      if (error) return { error: error.message }
    } else {
      // Remove bookmark
      const { error } = await supabaseAdmin
        .from('startup_bookmarks')
        .delete()
        .eq('user_id', user.user.id)
        .eq('startup_id', startupId)
      if (error) return { error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function requestMeeting(startupId: string, details: { topic: string, preferred_time: string }) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const supabaseAdmin = getSupabaseAdmin()
    
    // Find the startup leader to set as receiver_id
    const { data: startupData } = await supabaseAdmin
      .from('startups')
      .select('teams(leader_id)')
      .eq('id', startupId)
      .single()
      
    const receiverId = (startupData?.teams as any)?.leader_id

    const { error } = await supabaseAdmin
      .from('meeting_requests')
      .insert({
        sender_id: user.user.id,
        receiver_id: receiverId,
        startup_id: startupId,
        message: details.topic,
        meeting_time: details.preferred_time || new Date().toISOString(),
        status: 'pending'
      })

    if (error) return { error: error.message }
    
    // Phase 3 Notifications: Notify the startup leader
    if (receiverId) {
      const { createNotification } = require('./notification.service')
      await createNotification(receiverId, {
        title: 'New Meeting Request',
        message: `You have a new meeting request from a mentor regarding: ${details.topic}`,
        type: 'info'
      })
    }
    
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
