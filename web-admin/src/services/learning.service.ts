"use server"

import { createClient } from "@supabase/supabase-js"
import { ENV } from "@/config/env.config"
import { unstable_noStore as noStore } from 'next/cache'

// Helper to get Admin Supabase client (using SECRET KEY for full access)
function getAdminSupabase() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getCourses() {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_modules(count)')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getCourses error:', error)
    return []
  }
  return data || []
}

export async function getCourse(id: string) {
  noStore()
  const supabase = getAdminSupabase()
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_modules(*)')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('getCourse error:', error)
    return null
  }
  // Sort modules
  if (data && data.course_modules) {
    data.course_modules.sort((a: any, b: any) => a.order_index - b.order_index)
  }
  return data
}

export async function createCourse(course: any) {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase.from('courses').insert([course]).select().single()
  if (error) return { error: error.message }
  return { success: true, course: data }
}

export async function updateCourse(id: string, course: any) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('courses').update(course).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteCourse(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function addCourseModule(moduleId: string | null, courseId: string, module: any) {
  const supabase = getAdminSupabase()
  if (moduleId) {
    const { error } = await supabase.from('course_modules').update(module).eq('id', moduleId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('course_modules').insert([{ ...module, course_id: courseId }])
    if (error) return { error: error.message }
  }
  return { success: true }
}

export async function deleteCourseModule(id: string) {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from('course_modules').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function uploadCourseFile(formData: FormData, bucket: string = 'course-thumbnails') {
  try {
    const file = formData.get('file') as File
    if (!file) return { error: "No file provided" }

    const supabase = getAdminSupabase()
    
    // Ensure bucket exists
    await supabase.storage.createBucket(bucket, { public: true }).catch(() => {})

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (uploadError) return { error: uploadError.message }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
    
    return { success: true, url: data.publicUrl }
  } catch (err: any) {
    return { error: err.message }
  }
}
