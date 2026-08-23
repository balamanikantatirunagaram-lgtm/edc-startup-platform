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
      .select('id, team_id, teams(id, name, startups!fk_startup(id, name, industry, stage))')
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

    // Count meetings requested with this mentor
    const { count: totalMeetings } = await supabase
      .from('meeting_requests')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', mentorId)

    // Fetch recent messages across all mentored teams
    const mentoredTeamIds = activeRequests?.map(req => req.team_id) || []
    let recentMessages: Array<{ teamName: string; content: string; isRead: boolean }> = []
    if (mentoredTeamIds.length > 0) {
      const { data: recentMsgs } = await supabase
        .from('mentor_messages')
        .select('team_id, content, is_read, teams(name)')
        .eq('mentor_id', mentorId)
        .neq('sender_id', mentorId)
        .in('team_id', mentoredTeamIds)
        .order('created_at', { ascending: false })
        .limit(3)
      recentMessages = recentMsgs?.map(m => {
        const team = Array.isArray(m.teams) ? m.teams[0] : (m.teams as any)
        return {
          teamName: team?.name || 'Unknown Team',
          content: m.content,
          isRead: m.is_read
        }
      }) || []
    }

    const stats = {
      activeStartups: activeRequests?.length || 0,
      pendingRequests: pendingRequests?.length || 0,
      unreadMessages: unreadMessages || 0,
      totalMeetings: totalMeetings || 0
    }

    // Format active startups
    const recentStartups = activeRequests?.map(req => {
      const team = Array.isArray(req.teams) ? req.teams[0] : req.teams
      const startup = team?.startups ? (Array.isArray(team.startups) ? team.startups[0] : team.startups) : null
      return {
        id: startup?.id || team?.id,
        startupId: startup?.id || null,
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
      pendingRequests: formattedPending,
      recentMessages
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
    
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { error: "Not authenticated" }

    // Get the request details first (service key — mentor identity checked above)
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    const { data: request } = await supabaseAdmin
      .from('mentorship_requests')
      .select('id, team_id, mentor_id, status, teams(leader_id)')
      .eq('id', requestId)
      .single()

    if (!request) return { error: "Request not found." }

    // State-machine guards: only the request's mentor may decide it,
    // and only while it is still pending.
    if (request.mentor_id !== user.user.id) {
      return { error: "Not authorized" }
    }
    if (request.status !== 'pending') {
      return { error: `This request was already ${request.status}.` }
    }

    const { error } = await supabaseAdmin
      .from('mentorship_requests')
      .update({ status })
      .eq('id', requestId)

    if (error) throw error

    // Send notification
    if (request && request.team_id) {
      // Need a service role client to bypass RLS for fetching teams/users reliably if mentor can't see team details
      const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
        auth: { persistSession: false, autoRefreshToken: false }
      })
      
      const { data: team } = await supabaseAdmin
        .from('teams')
        .select('leader_id')
        .eq('id', request.team_id)
        .single()
        
      const { data: mentorRes } = await supabaseAdmin.auth.admin.getUserById(request.mentor_id)
      const mentor = mentorRes?.user
      
      const mentorName = mentor?.user_metadata?.name || mentor?.user_metadata?.full_name || 'A mentor'

      if (team && team.leader_id) {
        const { createNotification } = await import('./notifications.service')
        
        if (status === 'accepted') {
          await createNotification(
            team.leader_id, 
            'Mentorship Request Accepted!', 
            `${mentorName} has agreed to advise your startup. Check your dashboard to start chatting.`, 
            'success'
          )
        } else if (status === 'declined') {
          await createNotification(
            team.leader_id, 
            'Mentorship Request Declined', 
            `Unfortunately, ${mentorName} is currently unavailable to take on new mentees.`, 
            'error'
          )
        }
      }
    }

    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
