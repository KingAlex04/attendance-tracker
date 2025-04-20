import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

export function getUserFromToken(req: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
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