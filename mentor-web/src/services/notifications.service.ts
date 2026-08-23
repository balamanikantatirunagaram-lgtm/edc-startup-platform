'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY!
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!

export async function getMyNotifications() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return { notifications: [] }

  const supabase = createClient(supabaseUrl, supabasePublishableKey)
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  
  if (userError || !user) return { notifications: [] }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
    return { notifications: [] }
  }

  return { notifications: notifications || [] }
}

export async function markAllRead() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return { success: false }

  const supabase = createClient(supabaseUrl, supabasePublishableKey)
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  
  if (userError || !user) return { success: false }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('Error marking all read:', error)
    return { success: false }
  }

  return { success: true }
}

export async function markOneRead(id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return { success: false }

  const supabase = createClient(supabaseUrl, supabasePublishableKey)
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  
  if (userError || !user) return { success: false }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error marking one read:', error)
    return { success: false }
  }

  return { success: true }
}

export async function deleteNotification(id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return { success: false }

  const supabase = createClient(supabaseUrl, supabasePublishableKey)
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  
  if (userError || !user) return { success: false }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting notification:', error)
    return { success: false }
  }

  return { success: true }
}

export async function createNotification(userId: string, title: string, message: string, type: string = 'info') {
  const supabase = createClient(supabaseUrl, supabaseSecretKey)

  // Live table has top-level title/message columns (no payload JSONB)
  const { error } = await supabase
    .from('notifications')
    .insert([{ user_id: userId, title, message, type }])

  if (error) {
    console.error('Error creating notification:', error)
    return { success: false }
  }

  return { success: true }
}
