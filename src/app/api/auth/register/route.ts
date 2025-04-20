import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/lib/models/User';
import Company from '@/lib/models/Company';
import { generateToken } from '@/lib/utils/auth';

export async function POST(req: NextRequest) {
  try {
    // Validate request
    if (!req.body) {
      return NextResponse.json({ message: 'Request body is missing' }, { status: 400 });
    }

    // Connect to database with better error handling
    try {
      await dbConnect();
      console.log('Database connected successfully for registration');
    } catch (dbError) {
      console.error('Database connection error in register route:', dbError);
      return NextResponse.json(
        { message: 'Database connection error', error: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { name, email, password, role, companyDetails } = body;
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user with this email already exists
    let existingUser;
    try {
      existingUser = await User.findOne({ email });
    } catch (userLookupError) {
      console.error('Error checking for existing user:', userLookupError);
      return NextResponse.json(
        { message: 'Error checking for existing user', error: userLookupError instanceof Error ? userLookupError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
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
      try {
        const company = await Company.create({
          name: companyName,
          address,
          contactPerson,
          phone,
          email,
        });
        
        companyId = company._id;
        console.log('Company created with ID:', companyId);
      } catch (companyError) {
        console.error('Error creating company:', companyError);
        return NextResponse.json(
          { message: 'Error creating company', error: companyError instanceof Error ? companyError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }
    
    // Create user
    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
        role: role || UserRole.STAFF,
        ...(companyId && { companyId }),
      });
      console.log('User created with ID:', user._id);
    } catch (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { message: 'Error creating user', error: userError instanceof Error ? userError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    // Generate token
    let token;
    try {
      token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      return NextResponse.json(
        { message: 'Error generating token', error: tokenError instanceof Error ? tokenError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
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
      { message: 'Registration failed', error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 