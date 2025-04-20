import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Track Staff Attendance</span>
            <span className="block text-indigo-600">With Real-Time Location</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
            Our attendance tracker helps companies monitor staff check-ins, track locations,
            and generate comprehensive reports. Perfect for remote teams and field workers.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Companies</h2>
              <p className="text-gray-600 mb-4">
                Register your company, manage staff, track attendance, and generate reports.
              </p>
              <Link
                href="/register?role=company"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Register Company
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Staff</h2>
              <p className="text-gray-600 mb-4">
                Check in/out, track attendance history, and monitor your own performance.
              </p>
              <Link
                href="/register?role=staff"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Register as Staff
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Admin</h2>
              <p className="text-gray-600 mb-4">
                Manage companies, users, and access system-wide analytics and settings.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Admin Login
              </Link>
            </div>
          </div>
          
          <div className="mt-10">
            <p className="text-gray-600 mb-4">
              Already have an account?
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Attendance Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
