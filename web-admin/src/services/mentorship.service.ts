"use server"

import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getMentorshipEngagements() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Fetch all requests
    const { data: requests, error } = await supabaseAdmin
      .from('mentorship_requests')
      .select('id, topic, description, status, created_at, mentor_id, team_id, teams(id, name)')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Fetch all messages count
    const { data: allMessages } = await supabaseAdmin
      .from('mentor_messages')
      .select('id, team_id, mentor_id')

    // Fetch all mentors to resolve names
    const mentorIds = Array.from(new Set(requests.map(r => r.mentor_id)))
    const { data: mentors } = await supabaseAdmin
      .from('mentors')
      .select('id, name')
      .in('id', mentorIds)

    const engagements = requests.map(req => {
      const mentor = mentors?.find(m => m.id === req.mentor_id)
      const team = Array.isArray(req.teams) ? req.teams[0] : req.teams

      // Count messages for this specific engagement
      const messageCount = allMessages?.filter(m => m.team_id === req.team_id && m.mentor_id === req.mentor_id).length || 0

      return {
        id: req.id,
        topic: req.topic,
        description: req.description,
        status: req.status,
        dateCreated: req.created_at,
        mentorName: mentor?.name || 'Unknown Mentor',
        teamName: team?.name || 'Unknown Team',
        messageCount
      }
    })

    // Calculate metrics
    const metrics = {
      totalPending: engagements.filter(e => e.status === 'pending').length,
      totalActive: engagements.filter(e => e.status === 'accepted').length,
      totalMessages: allMessages?.length || 0
    }

    return { success: true, engagements, metrics }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function revokeMentorship(id: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('mentorship_requests')
      .update({ status: 'declined' })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
