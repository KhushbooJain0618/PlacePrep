import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/chat', '/interview', '/roadmap', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('placeprep_token')?.value;

  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));

  if (isProtected && !token) {
    const signupUrl = new URL('/signup', request.url);
    signupUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signupUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/interview/:path*',
    '/roadmap/:path*',
    '/profile/:path*',
  ],
};
