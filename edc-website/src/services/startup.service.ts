"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

function getAuthenticatedSupabase(token: string) {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY || ""
  return createClient(supabaseUrl, supabaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

export async function getMyStartup() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const supabaseAdmin = getSupabaseAdmin()
    // Find the team the user is an approved member of
    const { data: memberRecord } = await supabaseAdmin
      .from('team_members')
      .select('team_id, teams(id, name, leader_id)')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .limit(1)
      .maybeSingle()
      
    if (!memberRecord || !memberRecord.team_id) {
      return { noStartup: true }
    }

    const teamId = memberRecord.team_id

    // Fetch the startup
    const { data: startupData } = await supabaseAdmin
      .from('startups')
      .select('*')
      .eq('team_id', teamId)
      .maybeSingle()

    if (!startupData) {
      return { noStartup: true }
    }

    // Fetch team members
    const supabaseAdmin = getSupabaseAdmin()
    const { data: teamMembersDb } = await supabaseAdmin
      .from('team_members')
      .select('student_id')
      .eq('team_id', teamId)
      .eq('status', 'approved')

    const teamMembers = []
    if (teamMembersDb && teamMembersDb.length > 0) {
      const supabaseAdmin = getSupabaseAdmin()
      // Paginate to get ALL users, not just the first 50
      let allUsers: any[] = []
      let page = 1
      while (true) {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
        if (!usersData?.users || usersData.users.length === 0) break
        allUsers = [...allUsers, ...usersData.users]
        if (usersData.users.length < 1000) break
        page++
      }
      
      for (const m of teamMembersDb) {
        const u = allUsers.find(usr => usr.id === m.student_id)
        teamMembers.push({
          name: u?.user_metadata?.name || u?.user_metadata?.niat_id || 'Unknown Member',
          role: m.student_id === (memberRecord.teams as any).leader_id ? 'Team Leader' : 'Team Member',
          id: m.student_id
        })
      }
    }

    // Map to UI expectations
    return {
      success: true,
      isLeader: (memberRecord.teams as any).leader_id === user.user.id,
      startup: {
        id: startupData.id,
        name: startupData.name,
        tagline: startupData.tagline || "",
        problem: startupData.problem_statement || "",
        solution: startupData.proposed_solution || "",
        targetCustomers: startupData.target_customers || "",
        businessModel: startupData.business_model || "",
        revenueModel: startupData.revenue_model || "",
        status: startupData.status || "Pending Review",
        teamMembers,
        attachments: {
          pitchDeck: startupData.pitch_deck_url || null,
          website: startupData.website_url || null,
          demoVideo: startupData.demo_video_url || null,
          documents: startupData.documents || [],
        }
      }
    }
  } catch (err: any) {
    console.error(err)
    return { error: err.message }
  }
}

export async function updateMyStartup(data: any) {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const authSupabase = getAuthenticatedSupabase(token)
    const supabaseAdmin = getSupabaseAdmin()

    // Find the team
    const { data: memberRecord } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .limit(1)
      .maybeSingle()
      
    if (!memberRecord || !memberRecord.team_id) {
      return { error: "Not part of any team" }
    }

    // Only allow update of certain fields
    const updatePayload: any = {}
    if (data.tagline !== undefined) updatePayload.tagline = data.tagline
    if (data.problem !== undefined) updatePayload.problem_statement = data.problem
    if (data.solution !== undefined) updatePayload.proposed_solution = data.solution
    
    if (data.attachments) {
      if (data.attachments.pitchDeck !== undefined) updatePayload.pitch_deck_url = data.attachments.pitchDeck
      if (data.attachments.website !== undefined) updatePayload.website_url = data.attachments.website
      if (data.attachments.demoVideo !== undefined) updatePayload.demo_video_url = data.attachments.demoVideo
      if (data.attachments.documents !== undefined) updatePayload.documents = data.attachments.documents
    }

    const { error } = await authSupabase
      .from('startups')
      .update(updatePayload)
      .eq('team_id', memberRecord.team_id)

    if (error) {
      return { error: "Failed to update startup details." }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteMyStartup() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const supabase = getSupabase()
    const { data: user } = await supabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    const authSupabase = getAuthenticatedSupabase(token)

    // Find the specific team they are currently active in
    const { data: memberRecord } = await supabaseAdmin
      .from('team_members')
      .select('team_id, teams(leader_id)')
      .eq('student_id', user.user.id)
      .eq('status', 'approved')
      .limit(1)
      .maybeSingle()
      
    if (!memberRecord || !memberRecord.team_id) {
      return { error: "You are not an active member of any team." }
    }

    // @ts-ignore - PostgREST typings can be slightly off for joins
    const leaderId = memberRecord.teams?.leader_id || (Array.isArray(memberRecord.teams) ? memberRecord.teams[0]?.leader_id : null)

    if (leaderId !== user.user.id) {
      return { error: "You are not the leader of this team." }
    }

    const teamId = memberRecord.team_id

    // Delete in order to avoid foreign key constraints
    await supabaseAdmin.from('startups').delete().eq('team_id', teamId)
    await supabaseAdmin.from('tasks').delete().eq('team_id', teamId)
    await supabaseAdmin.from('team_members').delete().eq('team_id', teamId)
    await supabaseAdmin.from('teams').delete().eq('id', teamId)

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getStartupDocuments() {
  try {
    const { startup, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    const authSupabase = getAuthenticatedSupabase(token)

    const { data, error: docError } = await authSupabase
      .from('startup_documents')
      .select('*')
      .eq('startup_id', startup.id)
      .order('created_at', { ascending: false });

    if (docError) return { error: docError.message };
    return { documents: data || [] };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getStartupJourney() {
  try {
    const { startup, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    const authSupabase = getAuthenticatedSupabase(token)

    const { data, error: journeyError } = await authSupabase
      .from('startup_journey_stages')
      .select('*')
      .eq('startup_id', startup.id)
      .order('created_at', { ascending: true });

    if (journeyError) return { error: journeyError.message };

    return { stages: data || [], startupId: startup.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addStartupDocument(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const docType = formData.get('docType') as string
    const file = formData.get('file') as File

    if (!title || !docType || !file) {
      return { error: "Missing required fields" }
    }

    const { startup, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    const authSupabase = getAuthenticatedSupabase(token)

    const { data: user } = await authSupabase.auth.getUser(token)
    if (!user.user) return { error: "Not authenticated" }

    // Admin client to bypass storage RLS
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Ensure bucket exists (best effort)
    await supabaseAdmin.storage.createBucket('startup-documents', { public: true }).catch(() => {})

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload using Admin Client to bypass RLS policies that might be missing
    const { error: uploadError } = await supabaseAdmin.storage
      .from('startup-documents')
      .upload(fileName, file)

    if (uploadError) return { error: "Storage upload failed: " + uploadError.message }

    const { data: { publicUrl } } = supabaseAdmin.storage.from('startup-documents').getPublicUrl(fileName)

    const { error: insertError } = await supabaseAdmin
      .from('startup_documents')
      .insert([
        { startup_id: startup.id, title, doc_type: docType, file_url: publicUrl, uploaded_by: user.user.id }
      ]);

    if (insertError) return { error: insertError.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteStartupDocument(documentId: string) {
  try {
    const { startup, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    const authSupabase = getAuthenticatedSupabase(token)

    const { error: deleteError } = await authSupabase
      .from('startup_documents')
      .delete()
      .eq('id', documentId)
      .eq('startup_id', startup.id); // Ensure they own it

    if (deleteError) return { error: deleteError.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function advanceJourneyStage(stageName: string, expectedNextStatus: string = 'pending') {
  try {
    const { startup, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    // Admin client to bypass missing insert RLS policies for stages
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SECRET_KEY || "", {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { error: insertError } = await supabaseAdmin
      .from('startup_journey_stages')
      .insert([
        { startup_id: startup.id, stage_name: stageName, status: expectedNextStatus }
      ]);

    if (insertError) return { error: insertError.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function searchStartupDocuments(query: string) {
  try {
    const { startup, error } = await getMyStartup();
    if (error || !startup) return { error: error || "No startup found" };

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    const authSupabase = getAuthenticatedSupabase(token)

    const { data, error: docError } = await authSupabase
      .from('startup_documents')
      .select('*')
      .eq('startup_id', startup.id)
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false });

    if (docError) return { error: docError.message };
    return { documents: data || [] };
  } catch (err: any) {
    return { error: err.message };
  }
}
