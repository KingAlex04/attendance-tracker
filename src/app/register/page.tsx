'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import RegisterForm from './RegisterForm';
import ErrorBoundary from '@/components/ErrorBoundary';

// Main Register page component
export default function Register() {
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting safely
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          </div>
          {isMounted ? (
            <RegisterForm />
          ) : (
            <div className="text-center p-4">Loading registration form...</div>
          )}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 