"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY || ""
  return createClient(supabaseUrl, supabaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getAllJobPostings() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: jobs, error } = await supabaseAdmin
      .from('job_postings')
      .select(`
        *,
        startups (name)
      `)
      .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { jobs };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteJobPosting(id: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from('job_postings')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function postJobAdmin(jobData: any) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { error: insertError } = await supabaseAdmin
      .from('job_postings')
      .insert([
        { 
          startup_id: jobData.startup_id, 
          title: jobData.title, 
          description: jobData.description,
          role_type: jobData.role_type,
          location: jobData.location,
          stipend_salary: jobData.stipend_salary,
          skills_required: jobData.skills_required
        }
      ]);

    if (insertError) return { error: insertError.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getJobApplications(jobId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: applications, error } = await supabaseAdmin
      .from('job_applications')
      .select(`
        *,
        students(id, name, email, phone, department, academic_year)
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) return { error: error.message };
    return { applications };
  } catch (err: any) {
    return { error: err.message };
  }
}
