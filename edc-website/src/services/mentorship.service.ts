"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

function getSupabase(token?: string) {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  
  const options: any = {
    auth: { persistSession: false, autoRefreshToken: false }
  }
  
  if (token) {
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }
  
  return createClient(supabaseUrl, supabaseKey, options)
}

export async function requestMentorship(mentorId: string, topic: string, description: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) return { error: "Not authenticated" }
    
    const supabase = getSupabase(token)
    
    const { data: user, error: userError } = await supabase.auth.getUser()
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

export async function getMyMentorshipRequests() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { requests: [] }
    
    const supabase = getSupabase(token)
    
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) return { requests: [] }

    const { data: member } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (!member || !member.team_id) return { requests: [] }

    // Use admin client to bypass RLS if needed, though students should be able to read their own team's requests
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const { data: requests, error } = await supabaseAdmin
      .from('mentorship_requests')
      .select('id, mentor_id, topic, description, status, created_at')
      .eq('team_id', member.team_id)
      .order('created_at', { ascending: false })

    if (error || !requests) return { requests: [] }

    // Resolve mentor info by auth id first (new flow), falling back to the
    // legacy marketing-table rows for old data.
    const { resolveMentorProfiles } = await import('./mentor-directory.service')
    const profiles = await resolveMentorProfiles(requests.map(r => r.mentor_id))

    const enrichedRequests = requests.map(req => {
      const mentor = profiles[req.mentor_id]
      return {
        ...req,
        mentorName: mentor?.name || 'Unknown Mentor',
        mentorRole: mentor?.role || '',
        mentorCompany: mentor?.company || '',
        mentorImage: mentor?.image || null
      }
    })

    return { requests: enrichedRequests }
  } catch (err: any) {
    console.error(err)
    return { requests: [] }
  }
}
