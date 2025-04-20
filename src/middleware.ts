import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, isAdmin, isCompany, isStaff } from './lib/utils/auth';

// Update middleware to be compatible with Next.js 15
export function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/login',
    '/register',
    '/',
  ];

  // Check if the current path is in the public routes
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/assets/') ||
    request.nextUrl.pathname.startsWith('/_next/')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes - check for token
  const user = getUserFromToken(request);
  
  if (!user) {
    // If API route
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // If frontend route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (request.nextUrl.pathname.startsWith('/api/admin') && !isAdmin(request)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (request.nextUrl.pathname.startsWith('/api/company') && !isCompany(request) && !isAdmin(request)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (request.nextUrl.pathname.startsWith('/api/staff') && !isStaff(request) && !isCompany(request) && !isAdmin(request)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // Frontend route protection
  if (request.nextUrl.pathname.startsWith('/admin') && !isAdmin(request)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/company') && !isCompany(request) && !isAdmin(request)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/staff') && !isStaff(request) && !isCompany(request) && !isAdmin(request)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

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