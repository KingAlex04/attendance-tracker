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
    
    // Check if already checked out
    if (attendance.checkOut && attendance.checkOut.time) {
      return NextResponse.json(
        { message: 'You have already checked out today' },
        { status: 400 }
      );
    }
    
    // Add location to logs
    const now = new Date();
    attendance.locationLogs.push({
      lat: location.lat,
      lng: location.lng,
      timestamp: now,
    });
    
    await attendance.save();
    
    return NextResponse.json({
      message: 'Location tracked successfully',
      locationLogs: attendance.locationLogs,
    });
    
  } catch (error: any) {
    console.error('Location tracking error:', error);
    return NextResponse.json(
      { message: 'Location tracking failed', error: error.message },
      { status: 500 }
    );
  }
}

// Get my location log history
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
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      locationLogs: attendance.locationLogs,
    });
    
  } catch (error: any) {
    console.error('Get location logs error:', error);
    return NextResponse.json(
      { message: 'Failed to get location logs', error: error.message },
      { status: 500 }
    );
  }
} 