"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ""
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseAdminKey = process.env.SUPABASE_SECRET_KEY || ""
  return createClient(supabaseUrl, supabaseAdminKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function login(niatId: string, password: string) {
  try {
    const supabase = getSupabase()
    const email = `${niatId.toLowerCase()}@student.tartup.local`

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    if (data.session) {
      const cookieStore = await cookies()
      cookieStore.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })
    }

    const isFirstLogin = data.user.user_metadata?.is_first_login
    const name = data.user.user_metadata?.name || niatId

    return { success: true, isFirstLogin, name }
  } catch (err: any) {
    console.error("Login Error:", err)
    return { error: err?.message || String(err) }
  }
}

export async function setupFirstLogin(question: string, answer: string, newPassword: string) {
  try {
    const supabase = getSupabase()
    const supabaseAdmin = getSupabaseAdmin()
    
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return { error: "Invalid session" }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
      user_metadata: {
        ...user.user_metadata,
        security_question: question,
        security_answer: answer.toLowerCase().trim(),
        is_first_login: false
      }
    })

    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    console.error("First Login Error:", err)
    return { error: err?.message || String(err) }
  }
}

async function getUserByEmail(email: string) {
  const supabaseAdmin = getSupabaseAdmin()
  let page = 1;
  while (true) {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000
    });
    if (error || users.length === 0) break;
    const user = users.find(u => u.email === email);
    if (user) return user;
    if (users.length < 1000) break;
    page++;
  }
  return null;
}

export async function getSecurityQuestion(niatId: string) {
  try {
    const email = `${niatId.toLowerCase()}@student.tartup.local`
    const user = await getUserByEmail(email)
    
    if (!user) return { error: "User not found" }
    
    const question = user.user_metadata?.security_question
    if (!question) return { error: "No security question set for this user." }
    
    return { success: true, question }
  } catch (err: any) {
    console.error("Get Security Question Error:", err)
    return { error: err?.message || String(err) }
  }
}

export async function resetPasswordWithSecurityAnswer(niatId: string, answer: string, newPassword: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const email = `${niatId.toLowerCase()}@student.tartup.local`
    const user = await getUserByEmail(email)
    
    if (!user) return { error: "User not found" }

    const storedAnswer = user.user_metadata?.security_answer
    if (!storedAnswer || storedAnswer !== answer.toLowerCase().trim()) {
      return { error: "Incorrect security answer" }
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    })
    if (updateError) return { error: updateError.message }

    return { success: true }
  } catch (err: any) {
    console.error("Reset Password Error:", err)
    return { error: err?.message || String(err) }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = getSupabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return null
    
    const { data: user, error } = await supabase.auth.getUser(token)
    if (error || !user.user) return null

    return {
      niatId: user.user.user_metadata?.niat_id || '',
      name: user.user.user_metadata?.name || '',
      email: user.user.email || '',
    }
  } catch (err) {
    return null
  }
}
