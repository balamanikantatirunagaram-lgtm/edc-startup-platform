"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies, headers } from "next/headers"
import { ENV } from "@/config/env.config"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

// Simple in-memory rate limiting (Note: in a serverless environment, this resets per instance. Use Redis for production)
const rateLimitMap = new Map<string, { count: number; expires: number }>()

// Blocklist for logged-out JWTs
const jwtBlocklist = new Set<string>()

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseAdminKey = process.env.SUPABASE_SECRET_KEY || ""
  return createClient(supabaseUrl, supabaseAdminKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

function getJwtSecret() {
  return new TextEncoder().encode(process.env.SUPABASE_SECRET_KEY || 'fallback-secret-for-jwt')
}

export async function login(username: string, password: string) {
  try {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return { error: "Invalid username or password" }
    }
    if (!password || typeof password !== 'string' || password.length < 1) {
      return { error: "Invalid username or password" }
    }

    // 1. Rate Limiting Check
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const limitKey = `login_${ip}_${username}`
    const now = Date.now()
    const limitRecord = rateLimitMap.get(limitKey)

    if (limitRecord && now < limitRecord.expires) {
      if (limitRecord.count >= 5) {
        return { error: "Too many failed attempts. Please try again later." }
      }
    }

    // 2. Role-based checks based on username
    if (username.toUpperCase().startsWith('NIAT') || username.toLowerCase().includes('@student')) {
      return { error: "You are a student. Please use the student portal." }
    }
    if (username.toLowerCase().includes('@mentor') || username.toLowerCase().startsWith('mentor_')) {
      return { error: "You are a mentor. Please use the mentor portal." }
    }

    // 3. Fetch User
    const supabase = getSupabaseAdmin()
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    // Generic error to prevent user enumeration
    if (error || !admin) {
      recordFailedAttempt(limitKey, now, limitRecord)
      return { error: "Invalid username or password" }
    }

    // 3. Verify Password (handles both plaintext migration and bcrypt)
    let isMatch = false
    let needsHashing = false

    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, admin.password)
    } else {
      // Plaintext check - migration path
      isMatch = admin.password === password
      if (isMatch) needsHashing = true
    }

    if (!isMatch) {
      recordFailedAttempt(limitKey, now, limitRecord)
      return { error: "Invalid username or password" }
    }

    // 4. Upgrade Password Security (Migrate plaintext to bcrypt)
    if (needsHashing) {
      const hashedPassword = await bcrypt.hash(password, 10)
      await supabase
        .from('admins')
        .update({ password: hashedPassword })
        .eq('id', admin.id)
    }

    // Clear rate limit on success
    rateLimitMap.delete(limitKey)

    // 5. Issue JWT Session
    const token = await new SignJWT({ username: admin.username, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(getJwtSecret())

    const cookieStore = await cookies()
    cookieStore.set('admin-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    })

    return { success: true, name: admin.username }
  } catch (err: any) {
    console.error("Admin Login Error:", err)
    require('fs').appendFileSync('./logs/error.log', new Date().toISOString() + ': ' + (err?.stack || String(err)) + '\n');
    return { error: "An unexpected error occurred" }
  }
}

function recordFailedAttempt(key: string, now: number, record: any) {
  if (record && now < record.expires) {
    rateLimitMap.set(key, { count: record.count + 1, expires: record.expires })
  } else {
    // Lockout for 5 minutes after 5 attempts
    rateLimitMap.set(key, { count: 1, expires: now + 5 * 60 * 1000 })
  }
}

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-auth')?.value
  if (token) {
    jwtBlocklist.add(token) // Invalidate server-side
  }
  cookieStore.delete('admin-auth')
  return { success: true }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-auth')?.value
  
  if (!token || jwtBlocklist.has(token)) return null
  
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return {
      name: payload.username as string,
      niatId: 'Admin',
      email: 'admin@tartup.local'
    }
  } catch (err) {
    return null
  }
}
