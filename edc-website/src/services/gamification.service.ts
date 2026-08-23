"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""

export async function getGamificationPoints() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { points: [] }

    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    const { data: userData } = await supabase.auth.getUser(token)
    const user = userData?.user
    if (!user) return { points: [] }

    // Live table column is student_id (references public.students/auth.users)
    const { data, error } = await supabase
      .from('gamification_points')
      .select('*')
      .eq('student_id', user.id)

    if (error) {
      console.error('Error fetching gamification points:', error)
      return { points: [] }
    }
    return { points: data || [] }
  } catch (err) {
    console.error('Gamification error:', err)
    return { points: [] }
  }
}
