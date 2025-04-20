import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/lib/models/User';
import Company from '@/lib/models/Company';
import { generateToken } from '@/lib/utils/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { name, email, password, role, companyDetails } = body;
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    let companyId;
    
    // If registering as a company, create a company record
    if (role === UserRole.COMPANY && companyDetails) {
      const { companyName, address, contactPerson, phone } = companyDetails;
      
      // Validate company details
      if (!companyName || !address || !contactPerson || !phone) {
        return NextResponse.json(
          { message: 'Company details are incomplete' },
          { status: 400 }
        );
      }
      
      // Create company
      const company = await Company.create({
        name: companyName,
        address,
        contactPerson,
        phone,
        email,
      });
      
      companyId = company._id;
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || UserRole.STAFF,
      ...(companyId && { companyId }),
    });
    
    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    
    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;
    
    return NextResponse.json({
      message: 'User registered successfully',
      user: userObj,
      token,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed', error: error.message },
      { status: 500 }
    );
  }
} 