"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { getMyTeamStatus } from "./team.service"

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

function getAuthenticatedSupabase(token: string) {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
}

export async function getTeamTasks() {
  try {
    const status = await getMyTeamStatus()
    if (!status.hasTeam) return { tasks: [] }

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { tasks: [] }

    const supabase = getAuthenticatedSupabase(token)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('team_id', status.team?.id)
      .order('created_at', { ascending: false })

    if (error) return { tasks: [] }
    return { tasks: data }
  } catch (err) {
    return { tasks: [] }
  }
}

export async function createTask(title: string, description: string, assignedTo: string) {
  try {
    const status = await getMyTeamStatus()
    if (!status.hasTeam || !status.isLeader) return { error: "Not authorized" }

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    // Validate assignee is an approved member of this team
    const supabaseAdmin = getSupabaseAdmin()
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('team_id', status.team.id)
      .eq('student_id', assignedTo)
      .eq('status', 'approved')
      .limit(1).maybeSingle()
    if (!membership) return { error: "Assignee is not an active member of your team." }

    const supabase = getAuthenticatedSupabase(token)
    const { error } = await supabase
      .from('tasks')
      .insert({
        team_id: status.team.id,
        title,
        description,
        assigned_to: assignedTo,
        status: 'pending'
      })

    if (error) return { error: "Failed to create task" }

    // Notify the assignee
    try {
      const { createNotification } = await import('./notifications.service')
      await createNotification(assignedTo, 'New Task Assigned', `You were assigned "${title}" by your team leader.`, 'info')
    } catch (notifyErr) {
      console.error('Task notification failed:', notifyErr)
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  try {
    const teamStatus = await getMyTeamStatus()
    if (!teamStatus.hasTeam) return { error: "Not authorized" }

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    // Verify the task belongs to the caller's team
    const supabaseAdmin = getSupabaseAdmin()
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('id, team_id')
      .eq('id', taskId)
      .limit(1).maybeSingle()
    if (!task || !teamStatus.team || task.team_id !== teamStatus.team.id) {
      return { error: "Task not found in your team." }
    }

    const supabase = getAuthenticatedSupabase(token)
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) return { error: "Failed to update task" }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
