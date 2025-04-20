import { NextResponse } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/login',
  '/register',
  '/',
];

// Static paths that should always be accessible
const staticPaths = [
  '/_next/',
  '/assets/',
  '/favicon.ico',
  '/images/',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a public route or static asset
  if (
    publicRoutes.includes(pathname) || 
    staticPaths.some(path => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }
  
  // Get auth token from cookies or headers
  const authToken = request.cookies.get('token')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!authToken) {
    // If API route
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // If frontend route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Continue to the protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all frontend routes except public ones and static assets
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
}; 