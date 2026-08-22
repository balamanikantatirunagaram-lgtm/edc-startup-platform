"use server"

import { createClient } from "@supabase/supabase-js"
import { ENV } from "@/config/env.config"
import { unstable_noStore as noStore } from 'next/cache'

function getAdminSupabase() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getFundingOpportunities() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('funding_opportunities').select('*').order('created_at', { ascending: false })
  if (error) console.error(error)
  return data || []
}

export async function getFundingApplications() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('funding_applications').select(`
    *,
    funding_opportunities(*),
    startups(id, name, industry, stage)
  `).order('created_at', { ascending: false })
  if (error) console.error(error)
  return data || []
}

export async function createFundingOpportunity(payload: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('funding_opportunities').insert(payload).select().single()
  if (error) return { error: error.message }
  return { success: true, data }
}

export async function updateFundingOpportunity(id: string, payload: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('funding_opportunities').update(payload).eq('id', id).select().single()
  if (error) return { error: error.message }
  return { success: true, data }
}

export async function deleteFundingOpportunity(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('funding_opportunities').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
