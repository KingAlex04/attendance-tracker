import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Get current user's company
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get the current user's session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }
    
    // Get user from database to get their companyId
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || !user.companyId) {
      return NextResponse.json(
        { message: 'No company associated with this user' },
        { status: 404 }
      );
    }
    
    // Get the company details
    const company = await Company.findById(user.companyId);
    
    if (!company || !company.isActive) {
      return NextResponse.json(
        { message: 'Company not found or inactive' },
        { status: 404 }
      );
    }
    
    // Get staff count
    const staffCount = await User.countDocuments({
      companyId: company._id,
      isActive: true
    });
    
    return NextResponse.json({
      company: {
        ...company.toObject(),
        staffCount
      }
    });
    
  } catch (error: any) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch company', error: error.message },
      { status: 500 }
    );
  }
}

// Update current user's company (requires admin role)
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get the current user's session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }
    
    // Get user from database to get their companyId and check permissions
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || !user.companyId) {
      return NextResponse.json(
        { message: 'No company associated with this user' },
        { status: 404 }
      );
    }
    
    // Check if user has admin role for their company
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Forbidden: Insufficient permissions to update company' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { name, address, phone } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: 'Company name is required' },
        { status: 400 }
      );
    }
    
    // Get the company details
    const company = await Company.findById(user.companyId);
    
    if (!company || !company.isActive) {
      return NextResponse.json(
        { message: 'Company not found or inactive' },
        { status: 404 }
      );
    }
    
    // Update company fields
    company.name = name;
    company.address = address || company.address;
    company.phone = phone || company.phone;
    
    // Save the updated company
    await company.save();
    
    return NextResponse.json({
      message: 'Company updated successfully',
      company: company.toObject()
    });
    
  } catch (error: any) {
    console.error('Update company error:', error);
    return NextResponse.json(
      { message: 'Failed to update company', error: error.message },
      { status: 500 }
    );
  }
} 