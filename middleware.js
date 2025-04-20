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
  
  // Basic auth check - you'll need to adjust this based on how you're storing tokens
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
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
    // Match all frontend routes except public ones
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
}; 