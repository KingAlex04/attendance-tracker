'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/models/User';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token || !user || !user.role) {
        router.push('/login');
        return;
      }

      // Check if user has allowed role
      if (!allowedRoles.includes(user.role as UserRole)) {
        // Redirect based on role
        if (user.role === UserRole.ADMIN) {
          router.push('/admin/dashboard');
        } else if (user.role === UserRole.COMPANY) {
          router.push('/company/dashboard');
        } else {
          router.push('/staff/dashboard');
        }
        return;
      }

      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return authenticated ? <>{children}</> : null;
} 