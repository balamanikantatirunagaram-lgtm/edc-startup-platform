"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || ""

async function getAuthedClient() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return { supabase: null, userId: null }

  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return { supabase: null, userId: null }
  return { supabase, userId: user.id }
}

export async function getNotifications() {
  try {
    const { supabase, userId } = await getAuthedClient()
    if (!supabase || !userId) return { notifications: [] }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return { notifications: [] }
    return { notifications: data || [] }
  } catch {
    return { notifications: [] }
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const { supabase, userId } = await getAuthedClient()
    if (!supabase || !userId) return { error: "Not authenticated" }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Function to send notifications from server actions (using Admin client).
// The notifications table has top-level title/message/type/read columns (no payload JSONB).
export async function createNotification(userId: string, payload: { title?: string; message?: string; type?: string } | string, legacyPayload?: any) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Backwards compatibility: old signature was (userId, type, payload)
    const data = typeof payload === 'string'
      ? { title: legacyPayload?.title, message: legacyPayload?.message || '', type: payload }
      : { title: payload.title, message: payload.message || '', type: payload.type || 'info' }

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
