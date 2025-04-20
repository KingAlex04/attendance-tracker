import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Attendance from '@/lib/models/Attendance';
import { getUserFromToken } from '@/lib/utils/auth';
import { UserRole } from '@/lib/models/User';

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
    
    // Check if user is a company or admin
    if (user.role !== UserRole.COMPANY && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    const staffIdParam = url.searchParams.get('staffId');
    
    // Set default date range to current month if not provided
    const now = new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Build query
    const query: any = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    
    // If company user, restrict to their company
    if (user.role === UserRole.COMPANY) {
      // Find company user details to get companyId
      const companyUser = await User.findById(user.userId);
      
      if (!companyUser || !companyUser.companyId) {
        return NextResponse.json(
          { message: 'Company information not found' },
          { status: 404 }
        );
      }
      
      query.companyId = companyUser.companyId;
    }
    
    // If staffId is provided, filter by staffId
    if (staffIdParam) {
      query.userId = staffIdParam;
    }
    
    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 });
    
    // Get total count
    const totalCount = await Attendance.countDocuments(query);
    
    return NextResponse.json({
      records: attendanceRecords,
      total: totalCount,
    });
    
  } catch (error: any) {
    console.error('Get attendance records error:', error);
    return NextResponse.json(
      { message: 'Failed to get attendance records', error: error.message },
      { status: 500 }
    );
  }
} 