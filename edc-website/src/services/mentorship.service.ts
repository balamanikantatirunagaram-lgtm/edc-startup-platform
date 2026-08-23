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

    // Re-request support: UNIQUE(team_id, mentor_id) means a previous row may
    // exist. Only a 'declined' row can be reactivated; pending/accepted stay.
    const { data: existing } = await supabase
      .from('mentorship_requests')
      .select('id, status')
      .eq('team_id', member.team_id)
      .eq('mentor_id', mentorId)
      .limit(1).maybeSingle()

    if (existing) {
      if (existing.status === 'pending') {
        return { error: "You already have a pending request with this mentor." }
      }
      if (existing.status === 'accepted') {
        return { error: "You are already connected with this mentor." }
      }
      // status === 'declined' -> reactivate
      const { error: reErr } = await supabase
        .from('mentorship_requests')
        .update({ status: 'pending', topic, description })
        .eq('id', existing.id)
      if (reErr) return { error: "Failed to send request." }
      return { success: true, reactivated: true }
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

    if (error) throw error

    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." }
  }
}

// Student withdraws a PENDING request (row deleted so they can re-request cleanly later)
export async function cancelMentorshipRequest(requestId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    const supabase = getSupabase(token)
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) return { error: "Not authenticated" }

    const { data: member } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()
    if (!member || !member.team_id) return { error: "Not part of any team." }

    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    // Ownership guard: request must belong to caller's team and be pending
    const { data: req } = await supabaseAdmin
      .from('mentorship_requests')
      .select('id, team_id, status')
      .eq('id', requestId)
      .single()
    if (!req) return { error: "Request not found." }
    if (req.team_id !== member.team_id) return { error: "Not authorized" }
    if (req.status !== 'pending') return { error: "Only pending requests can be cancelled." }

    const { error } = await supabaseAdmin
      .from('mentorship_requests')
      .delete()
      .eq('id', requestId)

    if (error) return { error: "Failed to cancel request." }
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

// Mentor-written journey feedback for the student's startup (Feedback tab)
export async function getMentorFeedback() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { feedback: [] }

    const supabase = getSupabase(token)
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) return { feedback: [] }

    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const { data: member } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .limit(1).maybeSingle()
    if (!member || !member.team_id) return { feedback: [] }

    const { data: startup } = await supabaseAdmin
      .from('startups')
      .select('id')
      .eq('team_id', member.team_id)
      .maybeSingle()
    if (!startup) return { feedback: [] }

    const { data: stages, error } = await supabaseAdmin
      .from('startup_journey_stages')
      .select('stage_name, status, feedback, completed_at, created_at')
      .eq('startup_id', startup.id)
      .not('feedback', 'is', null)
      .order('created_at', { ascending: false })

    if (error) return { feedback: [] }

    // Flatten dated entries out of the appended-feedback blobs
    const entries: { stageName: string; text: string; date: string }[] = []
    for (const st of stages || []) {
      if (!st.feedback) continue
      const parts = st.feedback.split(/\n(?=\[\d{1,2}\/\d{1,2}\/\d{4})/g)
      for (const part of parts) {
        const m = part.match(/\[([^\]]+)\]\s*([^:]+):\n?([\s\S]*)/)
        if (m) {
          entries.push({ stageName: st.stage_name, date: m[1], text: `${m[2].trim()}: ${m[3].trim()}` })
        } else {
          entries.push({ stageName: st.stage_name, date: st.created_at ? new Date(st.created_at).toLocaleDateString() : '', text: part.trim() })
        }
      }
    }
    return { feedback: entries }
  } catch (err: any) {
    console.error(err)
    return { feedback: [] }
  }
}
