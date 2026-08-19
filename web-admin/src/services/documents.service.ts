"use server"

import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY || ""
  return createClient(supabaseUrl, supabaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getAllStartupDocuments() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: documents, error } = await supabaseAdmin
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

export async function deleteDocument(id: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from('startup_documents')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
