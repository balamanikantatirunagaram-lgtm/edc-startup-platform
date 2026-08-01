import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Routes accessible without authentication
const publicRoutes = [
  '/',
  '/login',
]

function getJwtSecret() {
  return new TextEncoder().encode(process.env.SUPABASE_SECRET_KEY || 'fallback-secret-for-jwt')
}

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

  const token = request.cookies.get('admin-auth')?.value
  const isPublicRoute = publicRoutes.includes(pathname)

  // 1. If user is NOT logged in and tries to access a protected route → redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Validate token if present
  if (token) {
    try {
      await jwtVerify(token, getJwtSecret())
      
      // If user IS logged in and tries to access login page → redirect to dashboard
      if (pathname === '/login' || pathname === '/') {
        const dashboardUrl = new URL('/admin', request.url)
        return NextResponse.redirect(dashboardUrl)
      }
    } catch (err) {
      // Invalid token, clear cookie and redirect to login if not a public route
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('admin-auth')
      if (!isPublicRoute) {
        return response
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
