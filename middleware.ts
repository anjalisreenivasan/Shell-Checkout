import { getSessionCookie } from 'better-auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up', '/items', '/api/auth', '/api/public']
const isPublicRoute = (pathname: string) =>
  PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))

export async function middleware(req: NextRequest) {
  if (isPublicRoute(req.nextUrl.pathname)) return NextResponse.next()

  const sessionCookie = getSessionCookie(req)

  if (!sessionCookie) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
