"use server"

import { createClient } from "@supabase/supabase-js"
import { unstable_noStore as noStore } from 'next/cache'

function getAdminSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || "" // Note: Using secret key for admin
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getAllStartups() {
  noStore()
  try {
    const supabase = getAdminSupabase()
    const { data: startups, error } = await supabase
      .from('startups')
      .select(`
        *,
        teams!startups_team_id_fkey (
          id,
          name,
          leader_id
        )
      `)
    
    if (error) {
      console.error('Error fetching startups:', error)
      return []
    }

    if (!startups || startups.length === 0) return []

    // Enrich with leader name and member count
    const enriched = await Promise.all(startups.map(async (s: any) => {
      let leaderName = 'Unknown'
      let leaderEmail = ''
      let memberCount = 0

      if (s.teams?.leader_id) {
        const { data: leader } = await supabase
          .from('students')
          .select('name, email')
          .eq('id', s.teams.leader_id)
          .limit(1)
          .maybeSingle()
        if (leader) {
          leaderName = leader.name || 'Unknown'
          leaderEmail = leader.email || ''
        }
      }

      if (s.teams?.id) {
        const { count } = await supabase
          .from('team_members')
          .select('id', { count: 'exact', head: true })
          .eq('team_id', s.teams.id)
          .eq('status', 'approved')
        memberCount = count || 0
      }

      return { ...s, leaderName, leaderEmail, memberCount }
    }))
    
    return enriched
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function deleteStartupAdmin(startupId: string) {
  noStore()
  try {
    const supabase = getAdminSupabase()

    // Get the startup to find team_id
    const { data: startup } = await supabase
      .from('startups')
      .select('id, team_id')
      .eq('id', startupId)
      .single()

    if (!startup) return { error: 'Startup not found' }

    const teamId = startup.team_id

    // Delete dependents first, checking each step so failures aren't masked
    const { data: postings } = await supabase.from('job_postings').select('id').eq('startup_id', startupId)
    const postingIds = (postings || []).map((j: any) => j.id)

    type StepResult = { error: unknown } | void
    const steps: Array<[string, () => PromiseLike<StepResult>]> = []
    if (postingIds.length > 0) steps.push(['job_applications', () => supabase.from('job_applications').delete().in('job_id', postingIds)])
    steps.push(
      ['job_postings', () => supabase.from('job_postings').delete().eq('startup_id', startupId)],
      ['startup_documents', () => supabase.from('startup_documents').delete().eq('startup_id', startupId)],
      ['startup_journey_stages', () => supabase.from('startup_journey_stages').delete().eq('startup_id', startupId)],
      ['startup_impact_scores', () => supabase.from('startup_impact_scores').delete().eq('startup_id', startupId)],
      ['tasks', () => supabase.from('tasks').delete().eq('team_id', teamId)],
      ['mentorship_requests', () => supabase.from('mentorship_requests').delete().eq('team_id', teamId)],
      ['startups', () => supabase.from('startups').delete().eq('id', startupId)],
      ['team_members', () => supabase.from('team_members').delete().eq('team_id', teamId)],
      ['teams', () => supabase.from('teams').delete().eq('id', teamId)],
    )

    for (const [label, run] of steps) {
      const result = await run()
      const error = result && typeof result === 'object' ? (result as any).error : undefined
      if (error) {
        console.error(`deleteStartupAdmin failed at ${label}:`, error)
        return { error: `Failed to delete ${label} — cleanup aborted to avoid orphaned data.` }
      }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getDuplicateTeamUsers() {
  noStore()
  try {
    const supabase = getAdminSupabase()

    // Find all leaders
    const { data: teams } = await supabase.from('teams').select('id, name, leader_id, startup_id')
    if (!teams) return { users: [] }

    // Group teams by leader_id
    const leaderMap: Record<string, any[]> = {}
    for (const t of teams) {
      if (!leaderMap[t.leader_id]) leaderMap[t.leader_id] = []
      leaderMap[t.leader_id].push(t)
    }

    // Filter to leaders with more than 1 team
    const duplicates = Object.entries(leaderMap)
      .filter(([_, teamsList]) => teamsList.length > 1)
      .map(([leaderId, teamsList]) => ({ leaderId, teams: teamsList }))

    if (duplicates.length === 0) return { users: [] }

    // Enrich with student names
    const leaderIds = duplicates.map(d => d.leaderId)
    const { data: students } = await supabase
      .from('students')
      .select('id, name, email')
      .in('id', leaderIds)

    const enriched = duplicates.map(d => {
      const student = students?.find(s => s.id === d.leaderId)
      return {
        ...d,
        leaderName: student?.name || 'Unknown',
        leaderEmail: student?.email || ''
      }
    })

    return { users: enriched }
  } catch (err: any) {
    return { users: [] }
  }
}

export interface IAdminStudent {
  id: string;
  email: string;
  name: string;
  niatId: string;
  department: string;
  academicYear: string;
  isSuspended: boolean;
}

export async function getAllStudents(): Promise<IAdminStudent[]> {
  noStore()
  try {
    const supabase = getAdminSupabase()
    
    // Fetch directly from the new students table with pagination to bypass 1000 limit
    let allStudents: any[] = []
    let page = 0
    while (true) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * 1000, (page + 1) * 1000 - 1)

      if (error) {
        console.error('Error fetching students:', error)
        break
      }
      if (!data || data.length === 0) break
      allStudents = [...allStudents, ...data]
      if (data.length < 1000) break
      page++
    }

    const students = allStudents

    return students.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name || 'Unknown',
      niatId: u.niat_id || '',
      department: u.department || '',
      academicYear: u.academic_year || '2nd Year',
      isSuspended: !!u.is_suspended,
    }))
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function getAdminStats() {
  noStore()
  try {
    const startups = await getAllStartups()
    const students = await getAllStudents()
    
    // Count anything not yet decided as pending review (handles legacy
    // 'Pending Review' strings, NULLs, and lowercase snake_case variants)
    const UNDECIDED = new Set(['pending', 'pending_review', 'pending review', 'submitted']);
    const pendingReviews = startups.filter(
      s => !s.status || UNDECIDED.has(String(s.status).toLowerCase())
    ).length
    
    return {
      totalStudents: students.length,
      totalStartups: startups.length,
      pendingReviews
    }
  } catch (err) {
    console.error(err)
    return {
      totalStudents: 0,
      totalStartups: 0,
      pendingReviews: 0
    }
  }
}

export async function updateStartupStatus(id: string, status: string, feedback?: string, nextSteps?: string, reviewer?: string) {
  try {
    const supabase = getAdminSupabase()
    const { error } = await supabase
      .from('startups')
      .update({ status })
      .eq('id', id)
      
    if (error) {
      return { error: error.message }
    }
    
    // Also record it in journey stages (named so it never hijacks a real
    // milestone via the UI's fuzzy stage_name matching)
    if (feedback || nextSteps) {
      const combinedFeedback = `${feedback ? `Feedback: ${feedback}\n` : ''}${nextSteps ? `Next Steps: ${nextSteps}` : ''}`
      await supabase
        .from('startup_journey_stages')
        .insert({
          startup_id: id,
          stage_name: `[Review] Status set to ${status}`,
          status: 'completed',
          feedback: combinedFeedback
        })
    }
    
    // Phase 3 Notifications: Notify startup leader
    const { data: startupData } = await supabase
      .from('startups')
      .select('teams(leader_id)')
      .eq('id', id)
      .single()
      
    const leaderId = (startupData?.teams as any)?.leader_id
    if (leaderId) {
      const { createNotification } = require('./notification.service')
      await createNotification(leaderId, 'journey_update', {
        message: `Your startup status has been updated to ${status}.`
      })
    }
    
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleStudentSuspension(userId: string, isSuspended: boolean) {
  try {
    const supabase = getAdminSupabase()
    
    // Update the students table
    const { error } = await supabase
      .from('students')
      .update({ is_suspended: isSuspended })
      .eq('id', userId)

    if (error) {
      return { error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function resetStudentPassword(userId: string, newPassword: string) {
  try {
    const supabase = getAdminSupabase()
    const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword })
    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getStartupDocumentsAdmin(startupId: string) {
  noStore()
  try {
    const supabase = getAdminSupabase()
    const { data, error } = await supabase
      .from('startup_documents')
      .select('*')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })
      
    if (error) return { error: error.message }
    return { documents: data || [] }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getStartupJourneyAdmin(startupId: string) {
  noStore()
  try {
    const supabase = getAdminSupabase()
    const { data, error } = await supabase
      .from('startup_journey_stages')
      .select('*')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: true })
      
    if (error) return { error: error.message }
    return { stages: data || [] }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateStartupJourneyStageAdmin(startupId: string, stageName: string, status: string, feedback?: string) {
  try {
    const supabase = getAdminSupabase()
    
    // Check if stage exists
    const { data: existing } = await supabase
      .from('startup_journey_stages')
      .select('id, feedback')
      .eq('startup_id', startupId)
      .eq('stage_name', stageName)
      .maybeSingle()

    if (existing) {
      const updatedFeedback = feedback 
        ? `${existing.feedback ? existing.feedback + '\n\n' : ''}[${new Date().toLocaleDateString()}] Admin:\n${feedback}`
        : existing.feedback

      const { error } = await supabase
        .from('startup_journey_stages')
        .update({
          status,
          feedback: updatedFeedback,
          completed_at: ['completed','approved'].includes(status) ? new Date().toISOString() : null
        })
        .eq('id', existing.id)

      if (error) return { error: error.message }
    } else {
      const { error } = await supabase
        .from('startup_journey_stages')
        .insert({
          startup_id: startupId,
          stage_name: stageName,
          status,
          feedback: feedback ? `[${new Date().toLocaleDateString()}] Admin:\n${feedback}` : null,
          completed_at: ['completed','approved'].includes(status) ? new Date().toISOString() : null
        })

      if (error) return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
export async function getTeamMembersAdmin(teamId: string) {
  noStore()
  try {
    const supabase = getAdminSupabase()
    const { data, error } = await supabase
      .from('team_members')
      .select('*, students(name, email, department)')
      .eq('team_id', teamId)
      
    if (error) return { error: error.message }
    return { members: data || [] }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getStudentProfileAdmin(studentId: string) {
  try {
    const supabase = getAdminSupabase()
    // Source of truth is public.students; auth metadata only carries optional extras
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()
    if (error || !student) return { error: error?.message || "User not found" }

    let meta: any = {}
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(studentId)
      meta = user?.user_metadata || {}
    } catch { /* metadata is optional */ }

    return {
      data: {
        ...meta,
        name: student.name,
        email: student.email,
        department: student.department,
        academicYear: student.academic_year,
        niatId: student.niat_id,
        created_at: student.created_at
      }
    }
  } catch (err: any) {
    return { error: err.message }
  }
}
