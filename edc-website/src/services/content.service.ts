"use server"

import { createClient } from "@supabase/supabase-js"
import { ENV } from "@/config/env.config"
import { unstable_noStore as noStore } from 'next/cache'
import { cookies } from "next/headers"

// Helper to get Supabase client (using anon key for reading public data)
function getSupabase() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

// Helper to get authenticated Supabase client for RLS policies
function getAuthenticatedSupabase(token: string) {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
}

export async function getEvents() {
  noStore()
  const supabase = getSupabase()
  const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('getEvents error:', error)
    return []
  }
  return data || []
}

export async function getResources() {
  noStore()
  const supabase = getSupabase()
  const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('getResources error:', error)
    return []
  }
  return data || []
}

export async function getMentors() {
  noStore()
  const supabase = getSupabase()
  const { data, error } = await supabase.from('mentors').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('getMentors error:', error)
    return []
  }
  return data || []
}

export async function getFundingOpportunities() {
  noStore()
  const supabase = getSupabase()
  const { data, error } = await supabase.from('funding_opportunities').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('getFundingOpportunities error:', error)
    return []
  }
  return data || []
}

export async function getUserRegistrations() {
  noStore()
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return []
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return []

    const authSupabase = getAuthenticatedSupabase(token)
    const { data, error } = await authSupabase.from('event_registrations').select('event_id').eq('student_id', user.user.id)
    if (error) return []
    return data.map(r => r.event_id)
  } catch {
    return []
  }
}

export async function registerForEvent(eventId: string) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const authSupabase = getAuthenticatedSupabase(token)
    const { error } = await authSupabase.from('event_registrations').insert([
      { event_id: eventId, student_id: user.user.id }
    ])

    if (error) {
      if (error.code === '23505') return { error: "You are already registered for this event." }
      return { error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
