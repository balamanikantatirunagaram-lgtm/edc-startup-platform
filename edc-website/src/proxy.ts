import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Routes accessible without authentication
const publicRoutes = [
  '/',
  '/login',
  '/first-login',
  '/forgot-password',
  '/reset-password',
  '/suspended',
  '/about',
  '/our-team',
  '/contact',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static files, images, and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('sb-access-token')?.value
  const isPublicRoute = publicRoutes.includes(pathname)

  // 1. If user is NOT logged in and tries to access a protected route → redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Validate token securely if present
  if (token) {
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_PUBLISHABLE_KEY || "",
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    
    // getUser hits the database or edge to cryptographically verify the token
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      // Invalid token, clear cookie and redirect if not a public route
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('sb-access-token')
      if (!isPublicRoute) {
        return response
      }
    } else {
      // User is logged in and token is valid
      if (pathname === '/login') {
        const dashboardUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(dashboardUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
