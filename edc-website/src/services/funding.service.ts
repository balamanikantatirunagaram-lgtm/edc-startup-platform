"use server"

import { getAuthenticatedSupabase } from "@/lib/supabase/client"

export async function getIncubators() {
  const supabase = await getAuthenticatedSupabase()
  const { data, error } = await supabase
    .from('incubator_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching incubators:', error)
    return { incubators: [] }
  }
  return { incubators: data }
}

export async function applyForFunding(opportunityId: string, startupId: string) {
  const supabase = await getAuthenticatedSupabase()
  const { data, error } = await supabase
    .from('funding_applications')
    .insert([{ opportunity_id: opportunityId, startup_id: startupId, status: 'pending' }])
  
  if (error) {
    console.error('Error applying for funding:', error)
    return { success: false, error: error.message }
  }
  return { success: true }
}
