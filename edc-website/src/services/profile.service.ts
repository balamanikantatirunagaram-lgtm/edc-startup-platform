'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY!
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!

export async function getMyProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return { profile: null }

  const supabase = createClient(supabaseUrl, supabasePublishableKey)
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  
  if (userError || !user) return { profile: null }

  return { profile: user.user_metadata || {} }
}

export async function updateMyProfile(data: any) {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return { success: false, error: 'Not authenticated' }

  const supabase = createClient(supabaseUrl, supabasePublishableKey)
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  
  if (userError || !user) return { success: false, error: 'Not authenticated' }

  const adminAuthClient = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const newMetadata = { ...user.user_metadata, ...data }

  const { error } = await adminAuthClient.auth.admin.updateUserById(user.id, {
    user_metadata: newMetadata
  })

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }

  // Also update public.students table for synchronized relational data
  const { error: studentError } = await adminAuthClient
    .from('students')
    .update({
      name: data.name || user.user_metadata.name,
      department: data.department || user.user_metadata.department,
      academic_year: data.academicYear || user.user_metadata.academic_year
    })
    .eq('id', user.id)

  if (studentError) {
    console.error('Error updating students table:', studentError)
    // We don't fail the whole request, but we log it.
  }

  return { success: true }
}
