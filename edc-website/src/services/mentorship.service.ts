"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function requestMentorship(mentorId: string, topic: string, description: string) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) return { error: "Not authenticated" }
    
    const { data: user, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user.user) return { error: "Not authenticated" }

    // Get the student's team ID
    const { data: member } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (!member || !member.team_id) {
      return { error: "You must be part of an approved team to request mentorship." }
    }

    const { error } = await supabase
      .from('mentorship_requests')
      .insert([{
        team_id: member.team_id,
        mentor_id: mentorId,
        topic,
        description,
        status: 'pending'
      }])

    if (error) {
      if (error.code === '23505') {
        return { error: "You have already sent a request to this mentor." }
      }
      throw error
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." }
  }
}
