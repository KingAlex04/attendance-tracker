'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AttendanceStatus {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  locationLogs?: Array<{
    lat: number;
    lng: number;
    timestamp: string;
  }>;
}

export default function StaffDashboard() {
  const [status, setStatus] = useState<AttendanceStatus>({
    isCheckedIn: false,
    isCheckedOut: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Fetch current attendance status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/staff/status', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch attendance status');
        }

        setStatus(data);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      }
    });
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    setLocationError('');

    try {
      const position = await getCurrentPosition();
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check in');
      }

      // Update status
      setStatus({
        isCheckedIn: true,
        isCheckedOut: false,
        checkInTime: new Date(data.attendance.checkIn.time).toLocaleTimeString(),
        lastLocation: {
          lat: location.lat,
          lng: location.lng,
          timestamp: new Date().toISOString(),
        },
        locationLogs: [
          {
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } catch (err: any) {
      if (err.code === 1) {
        setLocationError('Location permission denied. Please enable location services to check in.');
      } else {
        setError(err.message);
      }
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setLocationError('');

    try {
      const position = await getCurrentPosition();
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check out');
      }

      // Update status
      setStatus((prev) => ({
        ...prev,
        isCheckedOut: true,
        checkOutTime: new Date(data.attendance.checkOut.time).toLocaleTimeString(),
        workingHours: data.attendance.workingHours,
        lastLocation: {
          lat: location.lat,
          lng: location.lng,
          timestamp: new Date().toISOString(),
        },
        locationLogs: [
          ...(prev.locationLogs || []),
          {
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (err: any) {
      if (err.code === 1) {
        setLocationError('Location permission denied. Please enable location services to check out.');
      } else {
        setError(err.message);
      }
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    setActionLoading(true);
    setLocationError('');

    try {
      const position = await getCurrentPosition();
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/track-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to track location');
      }

      // Update status with latest location
      setStatus((prev) => ({
        ...prev,
        lastLocation: {
          lat: location.lat,
          lng: location.lng,
          timestamp: new Date().toISOString(),
        },
        locationLogs: data.locationLogs,
      }));
    } catch (err: any) {
      if (err.code === 1) {
        setLocationError('Location permission denied. Please enable location services to track location.');
      } else {
        setError(err.message);
      }
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-900">Staff Dashboard</h1>

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
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-5">Today&apos;s Attendance</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-2 text-xl font-semibold text-gray-900">
                  {status.isCheckedOut
                    ? 'Checked Out'
                    : status.isCheckedIn
                    ? 'Checked In'
                    : 'Not Checked In'}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Check In Time</h3>
                <p className="mt-2 text-xl font-semibold text-gray-900">
                  {status.checkInTime || 'Not checked in yet'}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Check Out Time</h3>
                <p className="mt-2 text-xl font-semibold text-gray-900">
                  {status.checkOutTime || 'Not checked out yet'}
                </p>
              </div>
            </div>

            {locationError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6" role="alert">
                <span className="block sm:inline">{locationError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleCheckIn}
                disabled={status.isCheckedIn || actionLoading}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  status.isCheckedIn || actionLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading && !status.isCheckedIn ? 'Checking In...' : 'Check In'}
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!status.isCheckedIn || status.isCheckedOut || actionLoading}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  !status.isCheckedIn || status.isCheckedOut || actionLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading && status.isCheckedIn && !status.isCheckedOut
                  ? 'Checking Out...'
                  : 'Check Out'}
              </button>
              <button
                onClick={handleUpdateLocation}
                disabled={!status.isCheckedIn || status.isCheckedOut || actionLoading}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  !status.isCheckedIn || status.isCheckedOut || actionLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionLoading && status.isCheckedIn && !status.isCheckedOut
                  ? 'Updating Location...'
                  : 'Update Location'}
              </button>
            </div>
          </div>

          {status.isCheckedIn && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-5">Location History</h2>
              {status.lastLocation && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Last Tracked Location</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Latitude:</span> {status.lastLocation.lat.toFixed(6)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Longitude:</span> {status.lastLocation.lng.toFixed(6)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Time:</span> {formatTime(status.lastLocation.timestamp)}
                    </p>
                  </div>
                </div>
              )}

              {status.locationLogs && status.locationLogs.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">All Logs Today</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Time
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Latitude
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Longitude
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {status.locationLogs.map((log, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(log.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.lat.toFixed(6)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.lng.toFixed(6)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No location logs recorded today.</p>
              )}
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-5">Recent Attendance</h2>
            <div className="mt-4">
              <Link
                href="/staff/attendance"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View attendance history
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 