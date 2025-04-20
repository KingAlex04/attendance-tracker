import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/lib/models/User';
import Attendance from '@/lib/models/Attendance';
import Report from '@/lib/models/Report';
import { getUserFromToken, isCompany, isAdmin } from '@/lib/utils/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Verify company or admin privileges
    const user = getUserFromToken(req);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!isCompany(req) && !isAdmin(req)) {
      return NextResponse.json(
        { message: 'Forbidden: Company or admin access required' },
        { status: 403 }
      );
    }
    
    // Get companyId 
    let companyId;
    
    if (isCompany(req)) {
      // Find the company user to get their companyId
      const companyUser = await User.findById(user.userId);
      
      if (!companyUser || !companyUser.companyId) {
        return NextResponse.json(
          { message: 'Company information not found' },
          { status: 404 }
        );
      }
      
      companyId = companyUser.companyId;
    } else {
      // Admin user must specify companyId in query params
      const url = new URL(req.url);
      companyId = url.searchParams.get('companyId');
      
      if (!companyId) {
        return NextResponse.json(
          { message: 'Company ID is required for admin users' },
          { status: 400 }
        );
      }
    }
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all staff for this company
    const totalStaff = await User.countDocuments({ 
      companyId, 
      role: UserRole.STAFF,
      isActive: true 
    });
    
    // Get active staff today
    const activeToday = await Attendance.countDocuments({
      companyId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    
    // Calculate average working hours (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const attendanceRecords = await Attendance.find({
      companyId,
      date: { $gte: thirtyDaysAgo },
      workingHours: { $exists: true, $ne: null }
    });
    
    let averageHours = 0;
    if (attendanceRecords.length > 0) {
      const totalHours = attendanceRecords.reduce((sum, record) => {
        return sum + (record.workingHours || 0);
      }, 0);
      averageHours = totalHours / attendanceRecords.length;
    }
    
    // Get recent reports count (last 30 days)
    const recentReports = await Report.countDocuments({
      companyId,
      createdAt: { $gte: thirtyDaysAgo },
    });
    
    // Get today's staff activity
    const staffActivity = await Attendance.find({
      companyId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate('userId', 'name email');
    
    const mappedStaffActivity = staffActivity.map(record => ({
      id: record.userId._id.toString(),
      name: record.userId.name,
      email: record.userId.email,
      status: record.status,
      checkInTime: record.checkIn?.time 
        ? new Date(record.checkIn.time).toLocaleTimeString() 
        : undefined,
      checkOutTime: record.checkOut?.time 
        ? new Date(record.checkOut.time).toLocaleTimeString() 
        : undefined,
      workingHours: record.workingHours,
    }));
    
    return NextResponse.json({
      totalStaff,
      activeToday,
      averageHours,
      recentReports,
      staffActivity: mappedStaffActivity,
    });
    
  } catch (error: any) {
    console.error('Company dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch company statistics', error: error.message },
      { status: 500 }
    );
  }
} 