"use server"

import { getAuthenticatedSupabase } from "@/lib/supabase/client"

export async function getAllCourses() {
  const supabase = await getAuthenticatedSupabase()
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_modules(count)')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error("Error fetching courses:", error)
    return []
  }
  return data || []
}

export async function getCourseDetails(courseId: string) {
  const supabase = await getAuthenticatedSupabase()
  
  // Get course + modules
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*, course_modules(*)')
    .eq('id', courseId)
    .single()
    
  if (courseError) {
    console.error("Error fetching course details:", courseError)
    return null
  }
  
  // Sort modules
  if (course && course.course_modules) {
    course.course_modules.sort((a: any, b: any) => a.order_index - b.order_index)
  }

  // Get enrollment status
  const { data: { session } } = await supabase.auth.getSession()
  let enrollment = null
  if (session?.user?.id) {
    const { data: enrollData } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', session.user.id)
      .maybeSingle()
      
    enrollment = enrollData
  }

  return { course, enrollment }
}

export async function enrollInCourse(courseId: string) {
  const supabase = await getAuthenticatedSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const { error } = await supabase
    .from('course_enrollments')
    .insert([{ 
      course_id: courseId, 
      student_id: session.user.id,
      progress: 0,
      completed: false
    }])
    
  if (error) {
    // If already enrolled (unique constraint violation), just return success anyway
    if (error.code === '23505') return { success: true }
    return { error: error.message }
  }
  return { success: true }
}

export async function updateCourseProgress(courseId: string, progress: number, completed: boolean = false) {
  const supabase = await getAuthenticatedSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const { error } = await supabase
    .from('course_enrollments')
    .update({ progress, completed })
    .eq('course_id', courseId)
    .eq('student_id', session.user.id)
    
  if (error) return { error: error.message }
  return { success: true }
}
