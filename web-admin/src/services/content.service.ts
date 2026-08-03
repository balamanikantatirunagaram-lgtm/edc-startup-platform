"use server"

import { createClient } from "@supabase/supabase-js"
import { ENV } from "@/config/env.config"
import { unstable_noStore as noStore } from 'next/cache'

// Helper to get Admin Supabase client (using SECRET KEY for full access)
function getAdminSupabase() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getEvents() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('events').select('*, event_registrations(count)').order('created_at', { ascending: false })
  if (error) {
    console.error('getEvents error:', error)
    return []
  }
  return data || []
}

export async function getEventRegistrations(eventId: string) {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase
    .from('event_registrations')
    .select(`
      id,
      students (
        id,
        name,
        niat_id
      )
    `)
    .eq('event_id', eventId)
    
  if (error) {
    console.error('getEventRegistrations error:', error)
    return []
  }
  return data || []
}

export async function createEvent(event: any) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('events').insert([event])
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateEvent(id: string, event: any) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('events').update(event).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteEvent(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

// ─── Resources ───────────────────────────────────────────────────────────────

export async function getResources() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('getResources error:', error)
    return []
  }
  return data || []
}

export async function createResource(resource: any) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('resources').insert([resource])
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteResource(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('resources').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateResource(id: string, resource: any) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('resources').update(resource).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

// ─── Mentors ─────────────────────────────────────────────────────────────────

export async function getMentors() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('mentors').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('getMentors error:', error)
    return []
  }
  return data || []
}

export async function createMentor(mentor: any) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('mentors').insert([mentor])
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteMentor(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('mentors').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateMentor(id: string, mentor: any) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('mentors').update(mentor).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

// ─── Funding Opportunities ───────────────────────────────────────────────────

export async function getFundingOpportunities() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('funding_opportunities').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('getFundingOpportunities error:', error)
    return []
  }
  return data || []
}

export async function createFundingOpportunity(funding: any) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('funding_opportunities').insert([funding])
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFundingOpportunity(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('funding_opportunities').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateFundingOpportunity(id: string, funding: any) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('funding_opportunities').update(funding).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
