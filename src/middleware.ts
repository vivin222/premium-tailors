import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect /shopkeeper routes
  if (request.nextUrl.pathname.startsWith('/shopkeeper')) {
    // Exclude the login page itself
    if (request.nextUrl.pathname === '/shopkeeper/login') {
      return NextResponse.next()
    }

    const authCookie = request.cookies.get('shopkeeper_auth')

    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/shopkeeper/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/shopkeeper/:path*',
}
