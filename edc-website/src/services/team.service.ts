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

export async function createTeam(data: any) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user.user) return { error: "Not authenticated" }

    // Generate a random 5 digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString()

    const { data: teamData, error } = await supabase
      .from('teams')
      .insert({
        name: data.teamName,
        code,
        leader_id: user.user.id
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return { error: "Failed to create team. Ensure you don't already have one." }
    }

    // Add leader to team_members automatically
    await supabase.from('team_members').insert({
      team_id: teamData.id,
      student_id: user.user.id,
      status: 'approved'
    })

    // Also register the startup details
    const { data: startupData, error: startupError } = await supabase
      .from('startups')
      .insert({
        team_id: teamData.id,
        name: data.startupName,
        problem_statement: data.problem_statement,
        proposed_solution: data.proposed_solution,
        stage: data.stage,
        industry: data.industry
      })
      .select()
      .single()
      
    if (startupError) {
      console.error(startupError)
      // Optional: rollback team creation if this was a real transaction
    } else {
      // Update the team with the startup_id
      await supabase.from('teams').update({ startup_id: startupData.id }).eq('id', teamData.id)
    }

    return { success: true, team: teamData }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function joinTeam(code: string) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    // Find team by code
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, leader_id')
      .eq('code', code)
      .single()

    if (teamError || !team) {
      return { error: "Invalid team code." }
    }

    // Check if user is already approved in any team
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (existing) {
      return { error: "You are already an approved member of a team." }
    }

    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        student_id: user.user.id,
        status: 'pending'
      })

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { error: "You are already part of a team or have a pending request." }
      }
      return { error: "Failed to send join request." }
    }

    // Notify team leader
    const { createNotification } = await import('./notifications.service')
    const studentName = user.user.user_metadata?.name || user.user.user_metadata?.niat_id || 'A student'
    await createNotification(team.leader_id, 'New Join Request', `${studentName} wants to join your team!`, 'info')

    return { success: true, teamName: team.name }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getTeamRequests() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { requests: [] }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { requests: [] }

    // Find team led by this user
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('leader_id', user.user.id)
      .maybeSingle()

    if (!team) return { requests: [] }

    const { data: requests, error: reqError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team.id)
      .in('status', ['pending', 'invited'])

    if (reqError || !requests || requests.length === 0) {
      return { success: true, teamId: team.id, requests: [] }
    }

    // Fetch ALL users with pagination to avoid the 50-user cap
    const { createClient } = require("@supabase/supabase-js")
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    let allUsers: any[] = []
    let page = 1
    while (true) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
      if (!usersData?.users || usersData.users.length === 0) break
      allUsers = [...allUsers, ...usersData.users]
      if (usersData.users.length < 1000) break
      page++
    }

    const enrichedRequests = requests.map((req: any) => {
      const found = allUsers.find((u: any) => u.id === req.student_id)
      return {
        ...req,
        studentName: found?.user_metadata?.name || found?.user_metadata?.niat_id || 'Unknown Student'
      }
    })

    return { success: true, teamId: team.id, requests: enrichedRequests }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function handleTeamRequest(requestId: string, status: 'approved' | 'rejected') {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    const { error } = await supabase
      .from('team_members')
      .update({ status })
      .eq('id', requestId)

    if (error) {
      if (error.code === '23505') {
        return { error: "Student is already an approved member of another team." }
      }
      return { error: "Failed to update request." }
    }

    // If approved, automatically reject all other pending/invited requests for this student
    if (status === 'approved') {
      const { data: request } = await supabase.from('team_members').select('student_id, team_id, teams(name)').eq('id', requestId).single()
      if (request) {
        await supabase
          .from('team_members')
          .update({ status: 'rejected' })
          .eq('student_id', request.student_id)
          .neq('id', requestId)
          .in('status', ['pending', 'invited'])
          
        const { createNotification } = await import('./notifications.service')
        const teamName = (request.teams as any)?.name || 'the team'
        await createNotification(request.student_id, 'Request Approved', `Your request to join ${teamName} was approved!`, 'success')
      }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function inviteStudent(userId: string, teamId: string) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    const { data: caller } = await supabase.auth.getUser(token)
    if (!caller.user) return { error: "Not authenticated" }

    if (!userId) return { error: "Student not found." }

    // Check if student is already in a team
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('student_id', userId)
      .eq('status', 'approved')
      .maybeSingle()
      
    if (existing) {
       return { error: "Student is already an approved member of a team." }
    }

    // Check for duplicate pending/invite
    const { data: dupCheck } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('team_id', teamId)
      .eq('student_id', userId)
      .maybeSingle()

    if (dupCheck) {
      return { error: `Student already has a ${dupCheck.status} request for this team.` }
    }

    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        student_id: userId,
        status: 'invited'
      })

    if (error) {
      if (error.code === '23505') return { error: "Student already in a team or invited." }
      return { error: "Failed to send invite." }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function searchStudentsByNiat(query: string) {
  try {
    const { createClient } = require("@supabase/supabase-js")
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Paginate through ALL users
    let allUsers: any[] = []
    let page = 1
    while (true) {
      const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
      if (error || !usersData?.users || usersData.users.length === 0) break
      allUsers = [...allUsers, ...usersData.users]
      if (usersData.users.length < 1000) break
      page++
    }

    const q = query.toLowerCase().trim()
    const matched = allUsers.filter(u => {
      const metadata = u.user_metadata || {}
      const niat = (metadata.niat_id || '').toLowerCase()
      const name = (metadata.name || '').toLowerCase()
      return niat.includes(q) || name.includes(q)
    }).slice(0, 8)

    return { 
      users: matched.map(u => ({
        userId: u.id,  // actual UUID for invite
        niatId: u.user_metadata?.niat_id || '',
        name: u.user_metadata?.name || u.user_metadata?.niat_id || 'Unknown',
      }))
    }
  } catch (err: any) {
    return { users: [] }
  }
}

export async function getMyInvitations() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { invitations: [] }

    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { invitations: [] }

    // Fetch team_members where status = 'invited' and student_id = user.id
    const { data, error } = await supabase
      .from('team_members')
      .select('id, team_id, created_at, teams(name)')
      .eq('student_id', user.user.id)
      .eq('status', 'invited')

    if (error || !data) return { invitations: [] }

    return { 
      invitations: data.map((inv: any) => ({
        id: inv.id,
        teamId: inv.team_id,
        teamName: inv.teams?.name || 'A team',
        createdAt: inv.created_at
      }))
    }
  } catch (err: any) {
    return { invitations: [] }
  }
}

export async function respondToInvitation(inviteId: string, status: 'approved' | 'rejected') {
  return handleTeamRequest(inviteId, status)
}

export async function removeTeamMember(studentId: string, teamId: string) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    // Verify leader
    const { data: team } = await supabase.from('teams').select('leader_id').eq('id', teamId).single()
    if (!team || team.leader_id !== user.user.id) {
      return { error: "Only the leader can remove members." }
    }

    if (studentId === user.user.id) {
      return { error: "Leader cannot be removed. You can transfer leadership or delete the team." }
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('student_id', studentId)

    if (error) return { error: "Failed to remove member." }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}


export async function getMyTeamStatus() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { hasTeam: false }

    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { hasTeam: false }

    const { data: member } = await supabase
      .from('team_members')
      .select('team_id, teams(id, name, code, leader_id)')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (!member) {
      return { hasTeam: false }
    }

    const teams = member.teams as any;
    return { 
      hasTeam: true, 
      isLeader: teams.leader_id === user.user.id,
      team: {
        id: teams.id,
        name: teams.name,
        code: teams.code
      }
    }
  } catch (err) {
    return { hasTeam: false }
  }
}
