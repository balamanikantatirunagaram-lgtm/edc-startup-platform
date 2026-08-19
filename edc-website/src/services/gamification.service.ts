"use server"

import { getAuthenticatedSupabase } from "@/lib/supabase/client"

export async function getGamificationPoints(userId: string) {
  const supabase = await getAuthenticatedSupabase()
  const { data, error } = await supabase
    .from('gamification_points')
    .select('*')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching gamification points:', error)
    return { points: [] }
  }
  return { points: data }
}
