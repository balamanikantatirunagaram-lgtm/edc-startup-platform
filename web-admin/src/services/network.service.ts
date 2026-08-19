"use server"

import { createClient } from "@supabase/supabase-js"
import { ENV } from "@/config/env.config"
import { unstable_noStore as noStore } from 'next/cache'

function getAdminSupabase() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

// Investors
export async function getInvestors() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('investor_profiles').select('*').order('created_at', { ascending: false })
  if (error) console.error(error)
  return data || []
}

export async function createInvestor(payload: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('investor_profiles').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateInvestor(id: string, payload: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('investor_profiles').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteInvestor(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('investor_profiles').delete().eq('id', id)
  if (error) throw error
}

// Incubators
export async function getIncubators() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('incubator_profiles').select('*').order('created_at', { ascending: false })
  if (error) console.error(error)
  return data || []
}

export async function createIncubator(payload: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('incubator_profiles').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateIncubator(id: string, payload: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('incubator_profiles').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteIncubator(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('incubator_profiles').delete().eq('id', id)
  if (error) throw error
}
