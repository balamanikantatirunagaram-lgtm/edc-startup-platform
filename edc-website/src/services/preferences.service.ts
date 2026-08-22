"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function updateNotificationPreferences(prefs: {
  emailAlerts: boolean
  feedbackAlerts: boolean
  weeklyDigest: boolean
}) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_PUBLISHABLE_KEY || "",
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SECRET_KEY || "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return { error: "Invalid session" }

    const notification_prefs = {
      ...user.user_metadata?.notification_prefs,
      ...prefs
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, notification_prefs }
    })
    if (error) return { error: error.message }
    return { success: true, prefs: notification_prefs }
  } catch (err: any) {
    console.error("Update Preferences Error:", err)
    return { error: err?.message || String(err) }
  }
}

export async function getNotificationPreferences() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_PUBLISHABLE_KEY || "",
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return null

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return null
    return user.user_metadata?.notification_prefs ?? null
  } catch {
    return null
  }
}
