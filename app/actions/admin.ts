"use server"

import { createClient } from "@supabase/supabase-js"

function getAdminSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || "" // Note: Using secret key for admin
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getAllStartups() {
  try {
    const supabase = getAdminSupabase()
    const { data: startups, error } = await supabase
      .from('startups')
      .select(`
        *,
        teams (
          name,
          leader_id
        )
      `)
    
    if (error) {
      console.error('Error fetching startups:', error)
      return []
    }
    
    return startups || []
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function getAllStudents() {
  try {
    const supabase = getAdminSupabase()
    const { data: usersData, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching students:', error)
      return []
    }
    
    return usersData.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || 'Unknown',
      niatId: u.user_metadata?.niat_id || '',
      department: u.user_metadata?.department || '',
      academicYear: u.user_metadata?.academicYear || '',
    }))
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function getAdminStats() {
  try {
    const startups = await getAllStartups()
    const students = await getAllStudents()
    
    const pendingReviews = startups.filter(s => s.status === 'pending' || !s.status).length
    
    return {
      totalStudents: students.length,
      totalStartups: startups.length,
      pendingReviews
    }
  } catch (err) {
    console.error(err)
    return {
      totalStudents: 0,
      totalStartups: 0,
      pendingReviews: 0
    }
  }
}

export async function updateStartupStatus(id: string, status: string) {
  try {
    const supabase = getAdminSupabase()
    const { error } = await supabase
      .from('startups')
      .update({ status })
      .eq('id', id)
      
    if (error) {
      return { error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
