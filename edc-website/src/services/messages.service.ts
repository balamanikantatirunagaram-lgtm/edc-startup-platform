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

function getSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getMentorMessages(mentorId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { messages: [] }

    const supabase = getSupabase(token)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { messages: [] }

    // Get the user's active team
    const { data: member } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (!member || !member.team_id) return { messages: [] }

    const supabaseAdmin = getSupabaseAdmin()

    // Fetch messages
    const { data: messages, error } = await supabaseAdmin
      .from('mentor_messages')
      .select('*')
      .eq('team_id', member.team_id)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Fetch sender names — senders may be students OR mentors (auth ids or legacy profile-table ids)
    const senderIds = Array.from(new Set(messages?.map(m => m.sender_id) || []))

    const { data: students } = await supabaseAdmin.from('students').select('id, name, niat_id').in('id', senderIds)
    const { resolveMentorProfiles } = await import('./mentor-directory.service')
    const mentorProfiles = await resolveMentorProfiles(senderIds)

    const enrichedMessages = messages?.map(msg => {
      let senderName = 'Unknown'
      const student = students?.find(s => s.id === msg.sender_id)
      if (student) senderName = student.name || student.niat_id
      else {
        const mentor = mentorProfiles[msg.sender_id]
        if (mentor) senderName = mentor.name
      }
      return {
        ...msg,
        senderName
      }
    }) || []

    return { success: true, messages: enrichedMessages, teamId: member.team_id }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function sendMentorMessage(mentorId: string, content: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    const supabase = getSupabase(token)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { error: "Not authenticated" }

    const { data: member } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (!member || !member.team_id) return { error: "No active team" }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: message, error } = await supabaseAdmin
      .from('mentor_messages')
      .insert({
        team_id: member.team_id,
        mentor_id: mentorId,
        sender_id: user.user.id,
        content
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, message }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Mark all of a mentor's messages in this thread as read (student opened it)
export async function markMentorMessagesRead(mentorId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    const supabase = getSupabase(token)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { error: "Not authenticated" }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: member } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .limit(1).maybeSingle()
    if (!member || !member.team_id) return { error: "No active team" }

    const { error } = await supabaseAdmin
      .from('mentor_messages')
      .update({ is_read: true })
      .eq('team_id', member.team_id)
      .eq('mentor_id', mentorId)
      .neq('sender_id', user.user.id)
      .eq('is_read', false)

    if (error) return { error: error.message }
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
