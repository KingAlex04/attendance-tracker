import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '../models/User';

// Make sure we're using the environment variable correctly
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'default-jwt-secret-for-development';

// Verify we have a valid secret
if (!JWT_SECRET || JWT_SECRET === 'default-jwt-secret-for-development') {
  console.warn('Warning: Using default JWT secret. Set JWT_SECRET in environment variables for production.');
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  try {
    // Try to get token from Authorization header first
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Try to get token from cookies as fallback
    const cookies = req.cookies;
    const tokenCookie = cookies.get('token');
    if (tokenCookie) {
      return tokenCookie.value;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting token from request:', error);
    return null;
  }
}

export function getUserFromToken(req: NextRequest): TokenPayload | null {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return null;
    }
    
    return verifyToken(token);
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

export function isAdmin(req: NextRequest): boolean {
  const user = getUserFromToken(req);
  return user?.role === UserRole.ADMIN;
}

export function isCompany(req: NextRequest): boolean {
  const user = getUserFromToken(req);
  return user?.role === UserRole.COMPANY;
}

export function isStaff(req: NextRequest): boolean {
  const user = getUserFromToken(req);
  return user?.role === UserRole.STAFF;
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { message: 'Unauthorized' },
    { status: 401 }
  );
}

export function forbidden(): NextResponse {
  return NextResponse.json(
    { message: 'Forbidden' },
    { status: 403 }
  );
} 