import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function getAuthenticatedSupabase() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value || ""
  
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
}
