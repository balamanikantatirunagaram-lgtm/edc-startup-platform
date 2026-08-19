"use server"

import { createClient } from '@supabase/supabase-js'
import { ENV } from '@/config/env.config'
import { unstable_noStore as noStore } from 'next/cache'

function getAdminSupabase() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getEventsAdmin() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('getEventsAdmin error:', error)
    return []
  }
  return data || []
}

export async function createEvent(event: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('events').insert([event]).select().single()
  if (error) return { error: error.message }
  return { success: true, event: data }
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

export async function getEventRegistrations(eventId: string) {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('event_registrations').select('*, profiles(full_name, email)').eq('event_id', eventId)
  if (error) {
    console.error('getEventRegistrations error:', error)
    return []
  }
  return data || []
}
