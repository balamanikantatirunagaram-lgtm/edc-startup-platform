"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { ENV } from "@/config/env.config"

function getAuthenticatedSupabase() {
  const cookieStore = cookies()
  const token = cookieStore.get('sb-access-token')?.value || ""
  
  return createClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: { persistSession: false }
    }
  )
}

export async function getAllStartupDocuments() {
  try {
    const supabase = getAuthenticatedSupabase()

    const { data: documents, error } = await supabase
      .from('startup_documents')
      .select(`
        *,
        startups (name)
      `)
      .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { documents };
  } catch (err: any) {
    return { error: err.message };
  }
}
