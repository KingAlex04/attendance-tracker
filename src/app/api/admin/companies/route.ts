import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Company from '@/lib/models/Company';
import User, { UserRole } from '@/lib/models/User';
import { isAdmin } from '@/lib/utils/auth';

// Get companies with pagination and filtering
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
    
    const url = new URL(req.url);
    
    // Parse pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const isActive = url.searchParams.get('active');
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Prepare query
    const query: any = {};
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Add active filter if provided
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    // Get total count for pagination
    const total = await Company.countDocuments(query);
    
    // Get companies
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Fetch staff counts for each company
    const companiesWithStaffCount = await Promise.all(
      companies.map(async (company) => {
        const staffCount = await User.countDocuments({
          companyId: company._id,
          role: UserRole.STAFF,
          isActive: true
        });
        
        return {
          ...company.toObject(),
          staffCount
        };
      })
    );
    
    return NextResponse.json({
      companies: companiesWithStaffCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch companies', error: error.message },
      { status: 500 }
    );
  }
}

// Create a new company
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Verify admin privileges
    if (!isAdmin(req)) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { name, email, address, phone, logo } = body;
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Company name and email are required' },
        { status: 400 }
      );
    }
    
    // Check if company with this email already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return NextResponse.json(
        { message: 'Company with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create new company
    const company = await Company.create({
      name,
      email,
      address,
      phone,
      logo,
      isActive: true,
    });
    
    return NextResponse.json({
      message: 'Company created successfully',
      company,
    });
    
  } catch (error: any) {
    console.error('Create company error:', error);
    return NextResponse.json(
      { message: 'Failed to create company', error: error.message },
      { status: 500 }
    );
  }
} 