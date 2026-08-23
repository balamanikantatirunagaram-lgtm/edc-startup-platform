"use server"

import { createClient } from "@supabase/supabase-js"
import { ENV } from "@/config/env.config"
import { unstable_noStore as noStore } from 'next/cache'

function getAdminSupabase() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

// Gamification
export async function getGamificationPoints() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('gamification_points').select(`
    *,
    students(*)
  `).order('created_at', { ascending: false })
  if (error) console.error(error)
  return data || []
}

export async function awardPoints(payload: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('gamification_points').insert(payload).select().single()
  if (error) throw error

  // Let the student know their points landed
  try {
    await supabase.from('notifications').insert([{
      user_id: payload.student_id,
      type: 'success',
      title: 'Points Awarded',
      message: `You earned ${payload.points} points: ${payload.reason}`
    }])
  } catch (notifyErr) {
    console.error('Award notification failed:', notifyErr)
  }

  return data
}

// AI Prompts
export async function getAIPrompts() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('ai_prompts').select('*').order('created_at', { ascending: false })
  if (error) console.error(error)
  return data || []
}

export async function createAIPrompt(payload: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('ai_prompts').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateAIPrompt(id: string, payload: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('ai_prompts').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteAIPrompt(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('ai_prompts').delete().eq('id', id)
  if (error) throw error
}
