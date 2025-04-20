import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/utils/auth';

export async function POST(req: NextRequest) {
  try {
    // Add request validation
    if (!req.body) {
      return NextResponse.json({ message: 'Request body is missing' }, { status: 400 });
    }

    // Connect to database with better error handling
    try {
      await dbConnect();
      console.log('Database connected successfully for login');
    } catch (dbError) {
      console.error('Database connection error in login route:', dbError);
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
    
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    let user;
    try {
      user = await User.findOne({ email });
      console.log('User lookup result:', user ? 'User found' : 'User not found');
    } catch (userLookupError) {
      console.error('Error during user lookup:', userLookupError);
      return NextResponse.json(
        { message: 'Error looking up user', error: userLookupError instanceof Error ? userLookupError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }
    
    // Verify password
    let isPasswordValid;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (passwordError) {
      console.error('Error during password verification:', passwordError);
      return NextResponse.json(
        { message: 'Error verifying password', error: passwordError instanceof Error ? passwordError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
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
        { message: 'Error generating authentication token', error: tokenError instanceof Error ? tokenError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;
    
    return NextResponse.json({
      message: 'Login successful',
      user: userObj,
      token,
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed', error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 