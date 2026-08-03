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

export async function getTeamTasks() {
  try {
    const status = await getMyTeamStatus()
    if (!status.hasTeam) return { tasks: [] }

    const supabase = getSupabase()
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

    const supabase = getSupabase()
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
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  try {
    const teamStatus = await getMyTeamStatus()
    if (!teamStatus.hasTeam) return { error: "Not authorized" }

    const supabase = getSupabase()
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
