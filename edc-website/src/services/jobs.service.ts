"use server"

import { cookies } from "next/headers"
import { getMyStartup } from "./startup.service"
import { createClient } from "@supabase/supabase-js"

function getAuthenticatedSupabase(token: string) {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
}
export async function getJobPostings() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    const authSupabase = getAuthenticatedSupabase(token)

    const { data: jobs, error } = await authSupabase
      .from('job_postings')
      .select(`
        *,
        startups (name)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { jobs };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getMyJobPostings() {
  try {
    const { startup, teamId, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    const authSupabase = getAuthenticatedSupabase(token)

    const { data: jobs, error: fetchError } = await authSupabase
      .from('job_postings')
      .select('*')
      .eq('startup_id', startup.id)
      .order('created_at', { ascending: false });

    if (fetchError) return { error: fetchError.message };
    return { jobs };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function postJob(jobData: any) {
  try {
    const { startup, teamId, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    // Use admin client to ensure we can post safely (bypassing any strict insert RLS if misconfigured)
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { error: insertError } = await supabaseAdmin
      .from('job_postings')
      .insert([
        { 
          startup_id: startup.id, 
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

export async function applyForJob(jobId: string, coverLetter: string, resumeFile?: File) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    // We can use getAuthenticatedSupabase to get the user ID
    const authSupabase = getAuthenticatedSupabase(token)
    const { data: user } = await authSupabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    // Use admin client to insert the application to bypass potential RLS complications
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    let resumeUrl = ""

    // Upload Resume to startup-documents bucket (or maybe a new resumes bucket)
    if (resumeFile) {
      await supabaseAdmin.storage.createBucket('resumes', { public: true }).catch(() => {})
      const fileExt = resumeFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabaseAdmin.storage.from('resumes').upload(fileName, resumeFile)
      if (uploadError) {
        console.error('Resume upload failed:', uploadError)
        return { error: "Failed to upload your resume. Please try again." };
      }
      resumeUrl = supabaseAdmin.storage.from('resumes').getPublicUrl(fileName).data.publicUrl
    }

    const { error: insertError } = await supabaseAdmin
      .from('job_applications')
      .insert([
        { 
          job_id: jobId, 
          student_id: user.user.id, 
          cover_letter: coverLetter,
          resume_url: resumeUrl
        }
      ]);

    if (insertError) return { error: insertError.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getMyApplications() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const authSupabase = getAuthenticatedSupabase(token)
    const { data: user } = await authSupabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const { data: applications, error } = await authSupabase
      .from('job_applications')
      .select(`
        *,
        job_postings (*, startups(name))
      `)
      .eq('student_id', user.user.id)
      .order('applied_at', { ascending: false });

    if (error) return { error: error.message };
    return { applications };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getStartupApplications() {
  try {
    const { startup, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: applications, error: fetchError } = await supabaseAdmin
      .from('job_applications')
      .select(`
        *,
        job_postings!inner(id, title, startup_id),
        students(id, name, email, department, academic_year)
      `)
      .eq('job_postings.startup_id', startup.id)
      .order('applied_at', { ascending: false });

    if (fetchError) return { error: fetchError.message };
    return { applications };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  try {
    const { startup, teamId, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Security check: verify this application belongs to this startup
    const { data: appCheck } = await supabaseAdmin
      .from('job_applications')
      .select('student_id, job_id, job_postings!inner(startup_id, role_type)')
      .eq('id', applicationId)
      .single();
      
    if (!appCheck || (appCheck.job_postings as any).startup_id !== startup.id) {
       return { error: "Unauthorized" };
    }

    const { error: updateError } = await supabaseAdmin
      .from('job_applications')
      .update({ status })
      .eq('id', applicationId);

    if (updateError) return { error: updateError.message };

    // Phase 2 Sync: If accepted, add to team roster and close job posting
    if (status === 'accepted') {
      // NOTE: team_members has no `role` column in the live DB — inserting one
      // fails silently and leaves the accepted applicant out of the team.
      const { data: existingMember } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('student_id', appCheck.student_id)
        .limit(1).maybeSingle();

      if (existingMember) {
        const { error: reErr } = await supabaseAdmin
          .from('team_members')
          .update({ status: 'approved' })
          .eq('id', existingMember.id)
        if (reErr) return { error: "Failed to add applicant to your team." }
      } else {
        const { error: teamErr } = await supabaseAdmin
          .from('team_members')
          .insert({
            team_id: teamId,
            student_id: appCheck.student_id,
            status: 'approved'
          });
        if (teamErr) return { error: "Failed to add applicant to your team." }
      }

      await supabaseAdmin
        .from('job_postings')
        .update({ status: 'closed' })
        .eq('id', appCheck.job_id);
    }
    
    // Phase 3 Notifications: Notify student (top-level title/message columns)
    const { createNotification } = require('./notification.service');
    await createNotification(appCheck.student_id, {
      title: status === 'accepted' ? 'Application Accepted' : `Application ${status}`,
      message: `Your application for ${(appCheck.job_postings as any).role_type} has been ${status}.`,
      type: status === 'accepted' ? 'success' : 'info'
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
