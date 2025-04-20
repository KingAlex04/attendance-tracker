'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalStaff: number;
  activeToday: number;
  averageHours: number;
  recentReports: number;
  staffActivity: Array<{
    id: string;
    name: string;
    email: string;
    status: 'present' | 'absent' | 'late';
    checkInTime?: string;
    checkOutTime?: string;
    workingHours?: number;
  }>;
}

export default function CompanyDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStaff: 0,
    activeToday: 0,
    averageHours: 0,
    recentReports: 0,
    staffActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/company/dashboard-stats', {
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
        <h1 className="text-3xl font-semibold text-gray-900">Company Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            href="/company/staff/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Staff
          </Link>
          <Link
            href="/company/reports/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Generate Report
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
                  <h2 className="text-sm font-medium text-gray-500">Total Staff</h2>
                  <p className="text-3xl font-semibold text-gray-900">{stats.totalStaff}</p>
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
                  href="/company/staff"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all staff
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Active Today</h2>
                  <p className="text-3xl font-semibold text-gray-900">{stats.activeToday}</p>
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
                  href="/company/attendance"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View attendance
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Average Hours</h2>
                  <p className="text-3xl font-semibold text-gray-900">{stats.averageHours.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href="/company/reports?type=monthly"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View monthly reports
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
                  href="/company/reports"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all reports
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-5">Today&apos;s Staff Activity</h2>
            {stats.staffActivity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Check In
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Check Out
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Hours
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.staffActivity.map((staff) => (
                      <tr key={staff.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                              <div className="text-sm text-gray-500">{staff.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              staff.status === 'present'
                                ? 'bg-green-100 text-green-800'
                                : staff.status === 'absent'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.checkInTime || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.checkOutTime || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.workingHours?.toFixed(1) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/company/staff/${staff.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 py-4">No staff activity recorded today.</p>
            )}
            <div className="mt-4">
              <Link
                href="/company/attendance"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all attendance records
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 