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

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY || ""
  return createClient(supabaseUrl, supabaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getAllStartups() {
  try {
    const supabase = getSupabaseAdmin()
    const { data: startups, error } = await supabase
      .from('startups')
      .select('*')

    if (error) return { error: error.message }
    return startups
  } catch (err: any) {
    return { error: err.message }
  }
}

function getAuthenticatedSupabase(token: string) {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
}

export async function getMyStartup() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const authSupabase = getAuthenticatedSupabase(token)
    // Find the team the user is an approved member of
    const { data: memberRecord } = await authSupabase
      .from('team_members')
      .select('team_id, teams(id, name, leader_id)')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()
      
    if (!memberRecord || !memberRecord.team_id) {
      return { noStartup: true }
    }

    const teamId = memberRecord.team_id

    // Fetch the startup
    const { data: startupData } = await authSupabase
      .from('startups')
      .select('*')
      .eq('team_id', teamId)
      .maybeSingle()

    if (!startupData) {
      return { noStartup: true }
    }

    // Fetch team members
    const supabaseAdmin = getSupabaseAdmin()
    const { data: teamMembersDb } = await supabaseAdmin
      .from('team_members')
      .select('student_id')
      .eq('team_id', teamId)
      .eq('status', 'approved')

    const teamMembers = []
    if (teamMembersDb && teamMembersDb.length > 0) {
      const supabaseAdmin = getSupabaseAdmin()
      // Paginate to get ALL users, not just the first 50
      let allUsers: any[] = []
      let page = 1
      while (true) {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
        if (!usersData?.users || usersData.users.length === 0) break
        allUsers = [...allUsers, ...usersData.users]
        if (usersData.users.length < 1000) break
        page++
      }
      
      for (const m of teamMembersDb) {
        const u = allUsers.find(usr => usr.id === m.student_id)
        teamMembers.push({
          name: u?.user_metadata?.name || u?.user_metadata?.niat_id || 'Unknown Member',
          role: m.student_id === (memberRecord.teams as any).leader_id ? 'Team Leader' : 'Team Member',
          id: m.student_id
        })
      }
    }

    // Map to UI expectations
    return {
      success: true,
      startup: {
        id: startupData.id,
        name: startupData.name,
        tagline: startupData.tagline || "",
        problem: startupData.problem_statement || "",
        solution: startupData.proposed_solution || "",
        targetCustomers: startupData.target_customers || "",
        businessModel: startupData.business_model || "",
        revenueModel: startupData.revenue_model || "",
        status: startupData.status || "Pending Review",
        teamMembers,
        attachments: {
          pitchDeck: startupData.pitch_deck_url || "",
          website: startupData.website_url || "",
          demoVideo: startupData.demo_video_url || "",
          documents: startupData.documents || []
        }
      }
    }
  } catch (err: any) {
    console.error(err)
    return { error: err.message }
  }
}

export async function updateMyStartup(data: any) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const authSupabase = getAuthenticatedSupabase(token)
    // Find the team
    const { data: memberRecord } = await authSupabase
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()
      
    if (!memberRecord || !memberRecord.team_id) {
      return { error: "Not part of any team" }
    }

    // Only allow update of certain fields
    const updatePayload: any = {}
    if (data.tagline !== undefined) updatePayload.tagline = data.tagline
    if (data.problem !== undefined) updatePayload.problem_statement = data.problem
    if (data.solution !== undefined) updatePayload.proposed_solution = data.solution
    
    if (data.attachments) {
      if (data.attachments.pitchDeck !== undefined) updatePayload.pitch_deck_url = data.attachments.pitchDeck
      if (data.attachments.website !== undefined) updatePayload.website_url = data.attachments.website
      if (data.attachments.demoVideo !== undefined) updatePayload.demo_video_url = data.attachments.demoVideo
      if (data.attachments.documents !== undefined) updatePayload.documents = data.attachments.documents
    }

    const { error } = await authSupabase
      .from('startups')
      .update(updatePayload)
      .eq('team_id', memberRecord.team_id)

    if (error) {
      return { error: "Failed to update startup details." }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteMyStartup() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const supabase = getSupabase()
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    // Find the specific team they are currently active in
    const { data: memberRecord } = await supabase
      .from('team_members')
      .select('team_id, teams(leader_id)')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .limit(1)
      .single()
      
    if (!memberRecord || !memberRecord.team_id) {
      return { error: "You are not an active member of any team." }
    }

    // @ts-ignore - PostgREST typings can be slightly off for joins
    const leaderId = memberRecord.teams?.leader_id || (Array.isArray(memberRecord.teams) ? memberRecord.teams[0]?.leader_id : null)

    if (leaderId !== user.user.id) {
      return { error: "You are not the leader of this team." }
    }

    const teamId = memberRecord.team_id

    // Delete in order to avoid foreign key constraints
    await supabaseAdmin.from('startups').delete().eq('team_id', teamId)
    await supabaseAdmin.from('tasks').delete().eq('team_id', teamId)
    await supabaseAdmin.from('team_members').delete().eq('team_id', teamId)
    await supabaseAdmin.from('teams').delete().eq('id', teamId)

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getStartupDocuments(startupId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const { data: documents, error } = await supabaseAdmin
      .from('startup_documents')
      .select('*')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { documents }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getStartupJourney(startupId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const { data: stages, error } = await supabaseAdmin
      .from('startup_journey_stages')
      .select('*')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { stages }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function addJourneyStageFeedback(stageId: string, feedback: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const supabase = getSupabase()
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    // Use admin client to bypass RLS, appending feedback to existing
    const { data: existingStage, error: getErr } = await supabaseAdmin
      .from('startup_journey_stages')
      .select('feedback')
      .eq('id', stageId)
      .single()

    if (getErr) return { error: getErr.message }

    const mentorName = user.user.user_metadata?.name || 'Mentor'
    const newFeedback = `${existingStage.feedback ? existingStage.feedback + '\n\n' : ''}[${new Date().toLocaleDateString()}] ${mentorName}:\n${feedback}`

    const { error: updateErr } = await supabaseAdmin
      .from('startup_journey_stages')
      .update({ feedback: newFeedback })
      .eq('id', stageId)

    if (updateErr) return { error: updateErr.message }
    
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateJourneyStageMentor(startupId: string, stageName: string, status: string, feedback?: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const supabase = getSupabase()
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const mentorName = user.user.user_metadata?.name || 'Mentor'

    const { data: existing } = await supabaseAdmin
      .from('startup_journey_stages')
      .select('id, feedback')
      .eq('startup_id', startupId)
      .eq('stage_name', stageName)
      .maybeSingle()

    if (existing) {
      const updatedFeedback = feedback
        ? `${existing.feedback ? existing.feedback + '\n\n' : ''}[${new Date().toLocaleDateString()}] ${mentorName}:\n${feedback}`
        : existing.feedback

      const { error } = await supabaseAdmin
        .from('startup_journey_stages')
        .update({
          status,
          feedback: updatedFeedback,
          completed_at: status === 'completed' || status === 'Approved' ? new Date().toISOString() : null
        })
        .eq('id', existing.id)

      if (error) return { error: error.message }
    } else {
      const { error } = await supabaseAdmin
        .from('startup_journey_stages')
        .insert({
          startup_id: startupId,
          stage_name: stageName,
          status,
          feedback: feedback ? `[${new Date().toLocaleDateString()}] ${mentorName}:\n${feedback}` : null,
          completed_at: status === 'completed' || status === 'Approved' ? new Date().toISOString() : null
        })

      if (error) return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
