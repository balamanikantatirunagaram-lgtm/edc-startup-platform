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

export async function getMentorDashboardData() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) return { error: "Not authenticated" }
    
    const supabase = getSupabase(token)
    
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) return { error: "Not authenticated" }

    const mentorId = user.user.id

    // Fetch active startups (teams that have accepted mentorship requests)
    const { data: activeRequests } = await supabase
      .from('mentorship_requests')
      .select('id, team_id, teams(id, name, startups(id, name, industry, stage))')
      .eq('mentor_id', mentorId)
      .eq('status', 'accepted')

    // Fetch pending requests
    const { data: pendingRequests } = await supabase
      .from('mentorship_requests')
      .select('id, topic, description, created_at, teams(name)')
      .eq('mentor_id', mentorId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // Count unread messages
    const { count: unreadMessages } = await supabase
      .from('mentor_messages')
      .select('id', { count: 'exact', head: true })
      .eq('mentor_id', mentorId)
      .eq('is_read', false)
      .neq('sender_id', mentorId)

    const stats = {
      activeStartups: activeRequests?.length || 0,
      pendingRequests: pendingRequests?.length || 0,
      unreadMessages: unreadMessages || 0,
      totalMeetings: 0 // Mocked for now until meetings table is added
    }

    // Format active startups
    const recentStartups = activeRequests?.map(req => {
      const team = Array.isArray(req.teams) ? req.teams[0] : req.teams
      const startup = team?.startups ? (Array.isArray(team.startups) ? team.startups[0] : team.startups) : null
      return {
        id: startup?.id || team?.id,
        name: startup?.name || team?.name || 'Unknown Team',
        industry: startup?.industry || 'Unspecified',
        stage: startup?.stage || 'Idea Phase',
        status: 'active'
      }
    }) || []

    // Format pending requests
    const formattedPending = pendingRequests?.map(req => ({
      id: req.id,
      teamName: Array.isArray(req.teams) ? req.teams[0]?.name : (req.teams as any)?.name || 'Unknown',
      topic: req.topic,
      description: req.description,
      date: new Date(req.created_at).toLocaleDateString()
    })) || []

    return { 
      success: true,
      stats,
      recentStartups,
      pendingRequests: formattedPending
    }

  } catch (error: any) {
    console.error("Dashboard error:", error)
    return { error: error.message || "Failed to load dashboard data" }
  }
}

export async function updateRequestStatus(requestId: string, status: 'accepted' | 'declined') {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const supabase = getSupabase(token)
    
    const { error } = await supabase
      .from('mentorship_requests')
      .update({ status })
      .eq('id', requestId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
