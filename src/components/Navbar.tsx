import Link from 'next/link';
import { UserRole } from '@/lib/models/User';

interface NavbarProps {
  role?: UserRole;
  userName?: string;
}

export default function Navbar({ role, userName }: NavbarProps) {
  // Define navigation links based on user role
  const getNavLinks = () => {
    switch (role) {
      case UserRole.ADMIN:
        return [
          { href: '/admin/dashboard', label: 'Dashboard' },
          { href: '/admin/companies', label: 'Companies' },
          { href: '/admin/users', label: 'Users' },
          { href: '/admin/staff-management', label: 'Staff Management' },
          { href: '/admin/reports', label: 'Reports' },
          { href: '/admin/settings', label: 'Settings' },
        ];
      case UserRole.COMPANY:
        return [
          { href: '/company/dashboard', label: 'Dashboard' },
          { href: '/company/staff', label: 'Staff' },
          { href: '/company/attendance', label: 'Attendance' },
          { href: '/company/reports', label: 'Reports' },
          { href: '/company/settings', label: 'Settings' },
        ];
      case UserRole.STAFF:
        return [
          { href: '/staff/dashboard', label: 'Dashboard' },
          { href: '/staff/attendance', label: 'My Attendance' },
          { href: '/staff/profile', label: 'Profile' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Attendance Tracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {userName ? (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-4">
                  Welcome, {userName}
                </span>
                <Link
                  href="/api/auth/logout"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 