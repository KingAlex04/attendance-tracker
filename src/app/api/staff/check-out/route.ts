import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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
    
    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      userId: user.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    
    if (!attendance) {
      return NextResponse.json(
        { message: 'No check-in found for today' },
        { status: 400 }
      );
    }
    
    if (attendance.checkOut && attendance.checkOut.time) {
      return NextResponse.json(
        { message: 'You have already checked out today' },
        { status: 400 }
      );
    }
    
    // Record check-out time and location
    const now = new Date();
    
    // Add location to logs
    attendance.locationLogs.push({
      lat: location.lat,
      lng: location.lng,
      timestamp: now,
    });
    
    // Set checkout details
    attendance.checkOut = {
      time: now,
      location,
    };
    
    // Calculate working hours
    if (attendance.checkIn && attendance.checkIn.time) {
      const checkInTime = new Date(attendance.checkIn.time).getTime();
      const checkOutTime = now.getTime();
      const diffInHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      attendance.workingHours = parseFloat(diffInHours.toFixed(2));
    }
    
    await attendance.save();
    
    return NextResponse.json({
      message: 'Check-out successful',
      attendance,
    });
    
  } catch (error: any) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { message: 'Check-out failed', error: error.message },
      { status: 500 }
    );
  }
} 