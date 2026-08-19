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

export async function uploadStartupDocument(formData: FormData) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const file = formData.get('file') as File
    const startup_id = formData.get('startup_id') as string
    const title = formData.get('title') as string
    const doc_type = formData.get('doc_type') as string

    if (!file || !startup_id || !title || !doc_type) {
      return { error: "Missing required fields" }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${startup_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

    // Ensure arrayBuffer logic works for Next.js File objects
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from('startup-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) return { error: uploadError.message }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('startup-documents')
      .getPublicUrl(fileName)

    const { error: dbError } = await supabaseAdmin
      .from('startup_documents')
      .insert({
        startup_id,
        title,
        doc_type,
        file_url: publicUrlData.publicUrl
      })

    if (dbError) return { error: dbError.message }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
