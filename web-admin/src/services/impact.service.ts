"use server"

import { createClient } from "@supabase/supabase-js"
import { ENV } from "@/config/env.config"
import { unstable_noStore as noStore } from 'next/cache'

function getAdminSupabase() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getImpactScores() {
  noStore()
  const supabase = getAdminSupabase()
  
  // We want to fetch categories and their impact scores
  const { data: categories, error: catError } = await supabase.from('viksit_bharat_categories').select('*')
  if (catError) console.error(catError)
  
  const { data: scores, error: scoreError } = await supabase.from('startup_impact_scores').select('*')
  if (scoreError) console.error(scoreError)

  return {
    categories: categories || [],
    scores: scores || []
  }
}
