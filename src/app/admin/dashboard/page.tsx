'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalCompanies: number;
  totalUsers: number;
  activeStaff: number;
  attendanceToday: number;
  recentReports: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    totalUsers: 0,
    activeStaff: 0,
    attendanceToday: 0,
    recentReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch dashboard statistics');
        }

        setStats(data);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            href="/admin/companies/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Company
          </Link>
          <Link
            href="/admin/users/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add User
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Total Companies</h2>
                  <p className="text-3xl font-semibold text-gray-900">{stats.totalCompanies}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href="/admin/companies"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all companies
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Total Users</h2>
                  <p className="text-3xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all users
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Active Staff Today</h2>
                  <p className="text-3xl font-semibold text-gray-900">{stats.activeStaff}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href="/admin/attendance"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View attendance
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Recent Reports</h2>
                  <p className="text-3xl font-semibold text-gray-900">{stats.recentReports}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href="/admin/reports"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View reports
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-5">Recent Activity</h2>
            <div className="border-t border-gray-200 divide-y divide-gray-200">
              <p className="py-4 text-gray-500">No recent activity</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 