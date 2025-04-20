import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/lib/models/Attendance';
import { getUserFromToken } from '@/lib/utils/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user from token
    const user = getUserFromToken(req);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance record
    const attendance = await Attendance.findOne({
      userId: user.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    
    if (!attendance) {
      // Not checked in today
      return NextResponse.json({
        isCheckedIn: false,
        isCheckedOut: false,
      });
    }
    
    // Prepare response
    const response = {
      isCheckedIn: true,
      isCheckedOut: !!attendance.checkOut?.time,
      checkInTime: attendance.checkIn?.time ? new Date(attendance.checkIn.time).toLocaleTimeString() : undefined,
      checkOutTime: attendance.checkOut?.time ? new Date(attendance.checkOut.time).toLocaleTimeString() : undefined,
      workingHours: attendance.workingHours,
      locationLogs: attendance.locationLogs.map(log => ({
        lat: log.lat,
        lng: log.lng,
        timestamp: log.timestamp,
      })),
    };
    
    // Add last location if exists
    if (attendance.locationLogs.length > 0) {
      const lastLog = attendance.locationLogs[attendance.locationLogs.length - 1];
      response.lastLocation = {
        lat: lastLog.lat,
        lng: lastLog.lng,
        timestamp: lastLog.timestamp,
      };
    }
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Get staff status error:', error);
    return NextResponse.json(
      { message: 'Failed to get staff status', error: error.message },
      { status: 500 }
    );
  }
} 