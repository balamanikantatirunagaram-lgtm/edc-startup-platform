"use server"

import { getAuthenticatedSupabase } from "@/lib/supabase/client"

export async function getViksitBharatCategories() {
  const supabase = await getAuthenticatedSupabase()
  const { data, error } = await supabase
    .from('viksit_bharat_categories')
    .select('*')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return { categories: [] }
  }
  return { categories: data }
}

export async function submitImpactScore(startupId: string, categoryId: string, score: number, description: string) {
  const supabase = await getAuthenticatedSupabase()
  const { data, error } = await supabase
    .from('startup_impact_scores')
    .insert([{ startup_id: startupId, category_id: categoryId, score, description }])
  
  if (error) {
    console.error('Error submitting impact score:', error)
    return { success: false, error: error.message }
  }
  return { success: true }
}
