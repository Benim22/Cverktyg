import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Skyddade rutter som kräver inloggning
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  
  // Kontrollera routen
  const path = req.nextUrl.pathname
  
  // Specialfall för preview med share-flagga
  const isSharedRoute = path.startsWith('/shared')
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  
  // Om användaren försöker nå en skyddad route utan att vara inloggad
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/signin', req.url)
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Om användaren redan är inloggad och försöker nå auth-sidorna
  if (session && (path.startsWith('/auth/signin') || path.startsWith('/auth/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  return res
}

// Matcha alla routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 