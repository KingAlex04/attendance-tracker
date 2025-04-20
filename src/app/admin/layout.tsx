'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { UserRole } from '@/lib/models/User';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.name || 'Admin',
          role: parsedUser.role,
        });
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
  }, []);

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="min-h-screen flex flex-col">
        <Navbar role={UserRole.ADMIN} userName={user?.name} />
        <div className="flex flex-col flex-grow">
          <div className="py-10">
            <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 