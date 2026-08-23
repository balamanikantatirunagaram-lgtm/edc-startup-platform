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

// investor_profiles.id is a FK to auth.users, so creating an investor requires
// provisioning an auth account first (same pattern as createMentor).
export async function createInvestorAccount(payload: {
  name: string
  email: string
  password: string
  company_name: string
  investment_stage: string[]
  portfolio_size?: number | null
}) {
  const supabase = getAdminSupabase()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      name: payload.name,
      role: 'investor',
      company_name: payload.company_name
    }
  })

  if (authError) return { error: `Failed to create account: ${authError.message}` }

  const { error } = await supabase.from('investor_profiles').insert([{
    id: authData.user.id,
    company_name: payload.company_name,
    investment_stage: payload.investment_stage,
    portfolio_size: payload.portfolio_size ?? null
  }])

  if (error) return { error: error.message }
  return { success: true }
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
