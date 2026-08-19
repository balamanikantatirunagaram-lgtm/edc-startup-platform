"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function uploadAvatar(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) return { error: "No file provided" }

    const cookieStore = await cookies()
    const token = cookieStore.get("sb-access-token")?.value
    if (!token) return { error: "Not authenticated" }

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SECRET_KEY || "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) return { error: "Not authenticated" }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, file)

    if (uploadError) return { error: uploadError.message }

    const { data } = supabaseAdmin.storage.from('avatars').getPublicUrl(fileName)
    
    // Update profile
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, avatarUrl: data.publicUrl }
    })

    return { success: true, publicUrl: data.publicUrl }
  } catch (err: any) {
    return { error: err.message }
  }
}
