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

export async function getDashboardData() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) {
      return { error: "Not authenticated" }
    }
    
    const { data: user, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user.user) {
      return { error: "Not authenticated" }
    }

    const userData = {
      name: user.user.user_metadata?.name || '',
      niatId: user.user.user_metadata?.niat_id || '',
      department: user.user.user_metadata?.department || '',
      academicYear: user.user.user_metadata?.academicYear || '',
      collegeId: user.user.user_metadata?.collegeId || '',
      phone: user.user.user_metadata?.phone || '',
      email: user.user.user_metadata?.email || user.user.email || ''
    }

    const { data: member } = await supabase
      .from('team_members')
      .select('team_id, teams(id, name, code, leader_id, startup_id)')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (!member || !member.teams) {
      return {
        user: userData,
        startup: null,
        hasTeam: false,
        isLeader: false,
        teamCode: null
      }
    }

    const team = member.teams

    let startupData = null
    if (team.startup_id) {
      const { data: startup } = await supabase
        .from('startups')
        .select('*')
        .eq('id', team.startup_id)
        .maybeSingle()
      
      if (startup) {
        startupData = {
          id: startup.id,
          name: startup.name,
          tagline: startup.problem_statement?.substring(0, 50) + "..." || "",
          stage: startup.stage,
          industry: startup.industry,
          problem: startup.problem_statement,
          solution: startup.proposed_solution,
          status: startup.status || 'pending'
        }
      }
    } else {
       // fallback, try to find startup by team_id
       const { data: startup } = await supabase
        .from('startups')
        .select('*')
        .eq('team_id', team.id)
        .maybeSingle()
        if (startup) {
          startupData = {
            id: startup.id,
            name: startup.name,
            tagline: startup.problem_statement?.substring(0, 50) + "..." || "",
            stage: startup.stage,
            industry: startup.industry,
            problem: startup.problem_statement,
            solution: startup.proposed_solution,
            status: startup.status || 'pending'
          }
        }
    }

    return {
      user: userData,
      startup: startupData,
      hasTeam: true,
      isLeader: team.leader_id === user.user.id,
      teamCode: team.code,
      teamName: team.name
    }
  } catch (err: any) {
    return { error: err.message }
  }
}
