"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies, headers } from "next/headers"

// Simple in-memory rate limiting (Note: in a serverless environment, this resets per instance. Use Redis for production)
const rateLimitMap = new Map<string, { count: number; expires: number }>()

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

export async function login(username: string, password: string) {
  try {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return { error: "Invalid credentials" }
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return { error: "Invalid credentials" }
    }

    // 1. Rate Limiting Check
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const limitKey = `login_${ip}_${username.toLowerCase()}`
    const now = Date.now()
    const limitRecord = rateLimitMap.get(limitKey)

    if (limitRecord && now < limitRecord.expires) {
      if (limitRecord.count >= 5) {
        return { error: "Too many failed attempts. Please try again later." }
      }
    }

    const isStudent = username.toUpperCase().startsWith('NIAT') || username.toLowerCase().includes('@student');
    if (isStudent) {
      return { error: "You are a student. Please use the student portal." }
    }

    const supabase = getSupabase()
    const email = `${username.toLowerCase()}@mentor.com`

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (limitRecord && now < limitRecord.expires) {
        rateLimitMap.set(limitKey, { count: limitRecord.count + 1, expires: limitRecord.expires })
      } else {
        rateLimitMap.set(limitKey, { count: 1, expires: now + 5 * 60 * 1000 })
      }
      return { error: "Account not found or invalid credentials" }
    }

    if (data.user?.user_metadata?.role !== 'mentor') {
      // In case they somehow logged in but aren't a mentor
      return { error: "You are a student. Please use the student portal." }
    }
    
    rateLimitMap.delete(limitKey)

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
    const name = data.user.user_metadata?.name || username

    return { success: true, isFirstLogin, name }
  } catch (err: any) {
    console.error("Login Error:", err)
    require('fs').appendFileSync('./logs/error.log', new Date().toISOString() + ': ' + (err?.stack || String(err)) + '\n');
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

export async function getSecurityQuestion(username: string) {
  try {
    const email = `${username.toLowerCase()}@mentor.com`
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

export async function resetPasswordWithSecurityAnswer(username: string, answer: string, newPassword: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const email = `${username.toLowerCase()}@mentor.com`
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
      avatarUrl: user.user.user_metadata?.avatarUrl || '',
    }
  } catch (err) {
    return null
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const supabase = getSupabase()
    const supabaseAdmin = getSupabaseAdmin()

    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return { error: "Not authenticated" }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user || !user.email) return { error: "Invalid session" }

    // Verify the current password before allowing a change
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })
    if (verifyError) return { error: "Current password is incorrect" }

    if (!newPassword || newPassword.length < 8) {
      return { error: "New password must be at least 8 characters" }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    })
    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    console.error("Change Password Error:", err)
    return { error: err?.message || String(err) }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  
  if (token) {
    const supabase = getSupabase()
    // Using global setSession to set the context for signOut (workaround for stateless server action)
    await supabase.auth.setSession({ access_token: token, refresh_token: '' })
    await supabase.auth.signOut()
  }

  cookieStore.delete('sb-access-token')
  return { success: true }
}
