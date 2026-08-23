"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

async function getAuthenticatedSupabase() {
  const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_PUBLISHABLE_KEY || "", {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (token) {
    await supabase.auth.setSession({ access_token: token, refresh_token: '' })
  }
  return supabase
}

export async function getNotifications() {
  try {
    const supabase = await getAuthenticatedSupabase()
    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes?.user) return { notifications: [] }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userRes.user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return { error: error.message }
    return { notifications: data }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const supabase = await getAuthenticatedSupabase()
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      
    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Function to send notifications from server actions (using Admin client)
export async function createNotification(userId: string, typeOrPayload: string | { title?: string; message?: string; type?: string }, maybePayload?: any) {
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Backwards compat: legacy signature (userId, type, payload) + new object signature.
    // Live table has top-level title/message/type columns (no payload JSONB).
    const data = typeof typeOrPayload === 'string'
      ? { title: maybePayload?.title, message: maybePayload?.message || '', type: typeOrPayload }
      : { title: typeOrPayload.title, message: typeOrPayload.message || '', type: typeOrPayload.type || 'info' }

    const { error } = await supabaseAdmin
      .from('notifications')
      .insert([{
        user_id: userId,
        title: data.title || 'Notification',
        message: data.message,
        type: data.type
      }])
      
    if (error) {
      console.error("Failed to create notification:", error)
      return { error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    console.error("Notification creation error:", err)
    return { error: err.message }
  }
}
