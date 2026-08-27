import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'vertex-secret-key-change-me';
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass next internals, auth APIs, and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get('crm_client_token')?.value ||
    request.cookies.get('vertex_client_token')?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const isAuthPage = pathname === '/login';
  const isProtectedPage =
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/conversations') ||
    pathname.startsWith('/leads') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/channels') ||
    pathname.startsWith('/usage') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/profile');

  // If not authenticated and trying to access protected page -> redirect to /login
  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // Clean stale cookies
    response.cookies.delete('crm_client_token');
    response.cookies.delete('vertex_client_token');
    return response;
  }

  // If already authenticated and trying to access login page -> redirect to /dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/conversations/:path*',
    '/leads/:path*',
    '/orders/:path*',
    '/channels/:path*',
    '/usage/:path*',
    '/settings/:path*',
    '/profile/:path*',
  ],
};
