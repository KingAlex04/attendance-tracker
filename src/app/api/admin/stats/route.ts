import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/lib/models/User';
import Company from '@/lib/models/Company';
import Attendance from '@/lib/models/Attendance';
import Report from '@/lib/models/Report';
import { getUserFromToken, isAdmin } from '@/lib/utils/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Verify admin privileges
    if (!isAdmin(req)) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get counts
    const totalCompanies = await Company.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    
    // Get active staff today
    const activeStaff = await Attendance.countDocuments({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    
    // Get attendance today
    const attendanceToday = await Attendance.countDocuments({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    
    // Get recent reports (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    
    return NextResponse.json({
      totalCompanies,
      totalUsers,
      activeStaff,
      attendanceToday,
      recentReports,
    });
    
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch admin statistics', error: error.message },
      { status: 500 }
    );
  }
} 