import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Attendance from '@/lib/models/Attendance';
import Report, { ReportType } from '@/lib/models/Report';
import { getUserFromToken } from '@/lib/utils/auth';
import { UserRole } from '@/lib/models/User';

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
    
    // Check if user is a company or admin
    if (user.role !== UserRole.COMPANY && user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { type, startDate, endDate, title, description } = body;
    
    // Validate input
    if (!type || !startDate || !endDate || !title) {
      return NextResponse.json(
        { message: 'Type, start date, end date, and title are required' },
        { status: 400 }
      );
    }
    
    if (!Object.values(ReportType).includes(type as ReportType)) {
      return NextResponse.json(
        { message: 'Invalid report type' },
        { status: 400 }
      );
    }
    
    // Set date parameters
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Get company details
    let companyId;
    
    if (user.role === UserRole.COMPANY) {
      const companyUser = await User.findById(user.userId);
      
      if (!companyUser || !companyUser.companyId) {
        return NextResponse.json(
          { message: 'Company information not found' },
          { status: 404 }
        );
      }
      
      companyId = companyUser.companyId;
    } else {
      // Admin must specify companyId
      if (!body.companyId) {
        return NextResponse.json(
          { message: 'Company ID is required for admin users' },
          { status: 400 }
        );
      }
      companyId = body.companyId;
    }
    
    // Query attendance records
    const query = {
      companyId,
      date: {
        $gte: parsedStartDate,
        $lte: parsedEndDate,
      },
    };
    
    const attendanceRecords = await Attendance.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 });
    
    // Generate report data
    const reportData = {
      totalRecords: attendanceRecords.length,
      periodStart: parsedStartDate,
      periodEnd: parsedEndDate,
      // Summary data
      summary: {
        present: attendanceRecords.filter(record => record.status === 'present').length,
        absent: attendanceRecords.filter(record => record.status === 'absent').length,
        late: attendanceRecords.filter(record => record.status === 'late').length,
        averageWorkingHours: calculateAverageWorkingHours(attendanceRecords),
      },
      // Records with user info
      records: attendanceRecords.map(record => ({
        date: record.date,
        userId: record.userId,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        workingHours: record.workingHours,
        status: record.status,
      })),
    };
    
    // Create report
    const report = await Report.create({
      companyId,
      type,
      title,
      description,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      generatedBy: user.userId,
      data: reportData,
    });
    
    return NextResponse.json({
      message: 'Report generated successfully',
      report,
    });
    
  } catch (error: any) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { message: 'Failed to generate report', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to calculate average working hours
function calculateAverageWorkingHours(records: any[]): number {
  if (records.length === 0) return 0;
  
  const validRecords = records.filter(record => typeof record.workingHours === 'number');
  
  if (validRecords.length === 0) return 0;
  
  const totalHours = validRecords.reduce((sum, record) => sum + record.workingHours, 0);
  return parseFloat((totalHours / validRecords.length).toFixed(2));
} 