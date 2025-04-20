import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/lib/models/User';
import { isAdmin } from '@/lib/utils/auth';

// Get users with pagination and filtering options
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
    
    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const role = url.searchParams.get('role');
    const search = url.searchParams.get('search');
    const companyId = url.searchParams.get('companyId');
    
    // Build query
    const query: any = {};
    
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      query.role = role;
    }
    
    if (companyId) {
      query.companyId = companyId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const users = await User.find(query)
      .select('-password')
      .populate('companyId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
      },
    });
    
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users', error: error.message },
      { status: 500 }
    );
  }
}

// Create a new user
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
    const { name, email, password, role, companyId, isActive } = body;
    
    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }
    
    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { message: 'Invalid role' },
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
    
    // Create user
    const userData = {
      name,
      email,
      password,
      role,
      isActive: isActive ?? true,
    };
    
    // Add companyId if role is STAFF or COMPANY
    if ((role === UserRole.STAFF || role === UserRole.COMPANY) && companyId) {
      userData.companyId = companyId;
    }
    
    const user = await User.create(userData);
    
    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;
    
    return NextResponse.json({
      message: 'User created successfully',
      user: userObj,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: 'Failed to create user', error: error.message },
      { status: 500 }
    );
  }
} 