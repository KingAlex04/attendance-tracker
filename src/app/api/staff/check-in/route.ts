import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Attendance from '@/lib/models/Attendance';
import { getUserFromToken } from '@/lib/utils/auth';

export async function POST(req: NextRequest) {
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
    
    const body = await req.json();
    const { location } = body;
    
    // Validate location input
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return NextResponse.json(
        { message: 'Valid location is required' },
        { status: 400 }
      );
    }
    
    // Get the user to get their company ID
    const userData = await User.findById(user.userId);
    
    if (!userData) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!userData.companyId) {
      return NextResponse.json(
        { message: 'User is not associated with a company' },
        { status: 400 }
      );
    }
    
    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      userId: user.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    
    if (existingAttendance) {
      return NextResponse.json(
        { message: 'You have already checked in today' },
        { status: 400 }
      );
    }
    
    // Create new attendance record
    const now = new Date();
    const attendance = await Attendance.create({
      userId: user.userId,
      companyId: userData.companyId,
      date: now,
      checkIn: {
        time: now,
        location,
      },
      locationLogs: [
        {
          lat: location.lat,
          lng: location.lng,
          timestamp: now,
        },
      ],
      status: 'present',
    });
    
    // Schedule hourly location tracking (handled by a separate process)
    // In a real app, you would use a job queue or a scheduler
    
    return NextResponse.json({
      message: 'Check-in successful',
      attendance,
    });
    
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { message: 'Check-in failed', error: error.message },
      { status: 500 }
    );
  }
} 