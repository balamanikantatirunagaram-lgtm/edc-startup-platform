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
          name,
          leader_id
        )
      `)
    
    if (error) {
      console.error('Error fetching startups:', error)
      return []
    }
    
    return startups || []
  } catch (err) {
    console.error(err)
    return []
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
    
    const pendingReviews = startups.filter(s => s.status === 'pending' || !s.status).length
    
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
    
    // Also record it in journey stages
    if (feedback || nextSteps) {
      const combinedFeedback = `${feedback ? `Feedback: ${feedback}\n` : ''}${nextSteps ? `Next Steps: ${nextSteps}` : ''}`
      await supabase
        .from('startup_journey_stages')
        .insert({
          startup_id: id,
          stage_name: `Status Update: ${status}`,
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
