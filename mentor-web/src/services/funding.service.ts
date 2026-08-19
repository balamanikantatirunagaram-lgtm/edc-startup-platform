"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY || ""
  return createClient(supabaseUrl, supabaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getFundingApplications() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const supabaseAdmin = getSupabaseAdmin()
    
    // As an incubator/investor, they would see applications submitted to them.
    // For simplicity, we filter by reviewer_id.
    const { data: applications, error } = await supabaseAdmin
      .from('funding_applications')
      .select('*, startups(name, tagline)')
      .eq('reviewer_id', user.user.id)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { applications }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateApplicationStatus(applicationId: string, status: string, feedback: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('funding_applications')
      .update({ status, feedback })
      .eq('id', applicationId)

    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
