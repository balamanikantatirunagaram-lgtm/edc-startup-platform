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

export async function getConversations() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { conversations: [] }

    const supabase = getSupabase(token)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { conversations: [] }

    const mentorId = user.user.id
    const supabaseAdmin = getSupabaseAdmin()

    // Get all accepted teams for this mentor
    const { data: activeRequests } = await supabaseAdmin
      .from('mentorship_requests')
      .select('team_id, teams(id, name)')
      .eq('mentor_id', mentorId)
      .eq('status', 'accepted')

    if (!activeRequests || activeRequests.length === 0) return { conversations: [] }

    // For each team, fetch the latest message and unread count
    const conversations = await Promise.all(activeRequests.map(async (req) => {
      const teamId = req.team_id
      const teamName = Array.isArray(req.teams) ? req.teams[0]?.name : (req.teams as any)?.name || 'Unknown Team'

      const { data: lastMessage } = await supabaseAdmin
        .from('mentor_messages')
        .select('content, created_at, sender_id, is_read')
        .eq('team_id', teamId)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count: unreadCount } = await supabaseAdmin
        .from('mentor_messages')
        .select('id', { count: 'exact', head: true })
        .eq('team_id', teamId)
        .eq('mentor_id', mentorId)
        .eq('is_read', false)
        .neq('sender_id', mentorId)

      return {
        teamId,
        teamName,
        lastMessage: lastMessage?.content || 'No messages yet.',
        time: lastMessage ? new Date(lastMessage.created_at).toLocaleDateString() : '',
        timestamp: lastMessage ? new Date(lastMessage.created_at).getTime() : 0,
        unreadCount: unreadCount || 0
      }
    }))

    // Sort by most recent
    conversations.sort((a, b) => b.timestamp - a.timestamp)

    return { success: true, conversations }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getTeamMessages(teamId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { messages: [] }

    const supabase = getSupabase(token)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { messages: [] }

    const mentorId = user.user.id
    const supabaseAdmin = getSupabaseAdmin()

    // Mark messages as read
    await supabaseAdmin
      .from('mentor_messages')
      .update({ is_read: true })
      .eq('team_id', teamId)
      .eq('mentor_id', mentorId)
      .neq('sender_id', mentorId)
      .eq('is_read', false)

    const { data: messages, error } = await supabaseAdmin
      .from('mentor_messages')
      .select('*')
      .eq('team_id', teamId)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Fetch sender names
    const senderIds = Array.from(new Set(messages?.map(m => m.sender_id) || []))
    const { data: students } = await supabaseAdmin.from('students').select('id, name, niat_id').in('id', senderIds)
    const { data: mentors } = await supabaseAdmin.from('auth.users').select('id, raw_user_meta_data').in('id', senderIds)

    const enrichedMessages = messages?.map(msg => {
      let senderName = 'Unknown'
      if (msg.sender_id === mentorId) {
        senderName = 'You'
      } else {
        const student = students?.find(s => s.id === msg.sender_id)
        if (student) senderName = student.name || student.niat_id
      }
      return {
        ...msg,
        senderName
      }
    }) || []

    return { success: true, messages: enrichedMessages }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function sendTeamMessage(teamId: string, content: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    const supabase = getSupabase(token)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { error: "Not authenticated" }

    const mentorId = user.user.id
    const supabaseAdmin = getSupabaseAdmin()

    const { data: message, error } = await supabaseAdmin
      .from('mentor_messages')
      .insert({
        team_id: teamId,
        mentor_id: mentorId,
        sender_id: mentorId,
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
