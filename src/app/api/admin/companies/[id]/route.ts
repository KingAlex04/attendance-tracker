import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
import { isAdmin } from '@/lib/utils/auth';

// Get company by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Verify admin privileges
    if (!isAdmin(req)) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    // Find company by ID
    const company = await Company.findById(id);
    
    // Check if company exists
    if (!company) {
      return NextResponse.json(
        { message: 'Company not found' },
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

// Update company by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Verify admin privileges
    if (!isAdmin(req)) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const body = await req.json();
    const { name, email, address, phone, logo, isActive } = body;
    
    // Find company by ID
    const company = await Company.findById(id);
    
    // Check if company exists
    if (!company) {
      return NextResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Check if email is being changed and if it's already in use
    if (email && email !== company.email) {
      const existingCompany = await Company.findOne({ email });
      if (existingCompany) {
        return NextResponse.json(
          { message: 'Email already in use by another company' },
          { status: 400 }
        );
      }
    }
    
    // Update company fields
    if (name) company.name = name;
    if (email) company.email = email;
    if (address !== undefined) company.address = address;
    if (phone !== undefined) company.phone = phone;
    if (logo !== undefined) company.logo = logo;
    if (isActive !== undefined) company.isActive = isActive;
    
    // Save updated company
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

// Delete company by ID (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Verify admin privileges
    if (!isAdmin(req)) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    // Find company by ID
    const company = await Company.findById(id);
    
    // Check if company exists
    if (!company) {
      return NextResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Soft delete by setting isActive to false
    company.isActive = false;
    await company.save();
    
    // Update all associated users to inactive as well
    await User.updateMany(
      { companyId: company._id },
      { isActive: false }
    );
    
    return NextResponse.json({
      message: 'Company deleted successfully',
    });
    
  } catch (error: any) {
    console.error('Delete company error:', error);
    return NextResponse.json(
      { message: 'Failed to delete company', error: error.message },
      { status: 500 }
    );
  }
} 