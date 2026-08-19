"use server"

import { getAuthenticatedSupabase } from "@/lib/supabase/client"

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
export async function createNotification(userId: string, type: string, payload: any) {
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert([{ user_id: userId, type, payload }])
      
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
