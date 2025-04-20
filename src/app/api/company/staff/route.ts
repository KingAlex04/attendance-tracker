import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Get all staff members for the current user's company
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
        { message: 'Forbidden: Insufficient permissions to view staff' },
        { status: 403 }
      );
    }
    
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('isActive');
    
    // Prepare query to filter staff by company
    const query: any = { companyId: user.companyId };
    
    // Add active status filter if specified
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    // Get staff members with filtered fields
    const staffMembers = await User.find(query)
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      count: staffMembers.length,
      data: staffMembers
    });
    
  } catch (error: any) {
    console.error('Get staff error:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve staff members', error: error.message },
      { status: 500 }
    );
  }
}

// Add a new staff member to the company
export async function POST(req: NextRequest) {
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
    
    // Get current user from database to get their companyId and check permissions
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser || !currentUser.companyId) {
      return NextResponse.json(
        { message: 'No company associated with this user' },
        { status: 404 }
      );
    }
    
    // Check if user has admin role for their company
    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Forbidden: Insufficient permissions to add staff' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { name, email, role, password } = body;
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields: name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate role - only allow staff, admin (superadmin creation is restricted)
    if (role && role !== 'staff' && role !== 'admin') {
      return NextResponse.json(
        { message: 'Invalid role. Role must be either "staff" or "admin"' },
        { status: 400 }
      );
    }
    
    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new user with the company ID of the current user
    const newUser = new User({
      name,
      email,
      password,
      role: role || 'staff', // Default to staff if not specified
      companyId: currentUser.companyId,
      isActive: true
    });
    
    await newUser.save();
    
    // Return the new user without password
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };
    
    return NextResponse.json(
      { message: 'Staff member added successfully', data: userResponse },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Add staff error:', error);
    return NextResponse.json(
      { message: 'Failed to add staff member', error: error.message },
      { status: 500 }
    );
  }
}

// Delete method actually deactivates a staff member
export async function DELETE(req: NextRequest) {
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
    
    // Get current user from database to get their companyId and check permissions
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser || !currentUser.companyId) {
      return NextResponse.json(
        { message: 'No company associated with this user' },
        { status: 404 }
      );
    }
    
    // Check if user has admin role for their company
    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Forbidden: Insufficient permissions to deactivate staff' },
        { status: 403 }
      );
    }
    
    // Extract staff ID from URL
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('id');
    
    if (!staffId) {
      return NextResponse.json(
        { message: 'Staff ID is required' },
        { status: 400 }
      );
    }
    
    // Find the staff member
    const staffMember = await User.findById(staffId);
    
    if (!staffMember) {
      return NextResponse.json(
        { message: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    // Check if staff member belongs to the same company
    if (staffMember.companyId.toString() !== currentUser.companyId.toString()) {
      return NextResponse.json(
        { message: 'Cannot deactivate staff from another company' },
        { status: 403 }
      );
    }
    
    // Don't allow deactivating self
    if (staffMember._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { message: 'You cannot deactivate your own account' },
        { status: 400 }
      );
    }
    
    // Deactivate instead of deleting
    staffMember.isActive = false;
    await staffMember.save();
    
    return NextResponse.json({
      message: 'Staff member deactivated successfully'
    });
    
  } catch (error: any) {
    console.error('Deactivate staff error:', error);
    return NextResponse.json(
      { message: 'Failed to deactivate staff member', error: error.message },
      { status: 500 }
    );
  }
}

// Update a staff member's information
export async function PATCH(req: NextRequest) {
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
    
    // Get current user from database to get their companyId and check permissions
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser || !currentUser.companyId) {
      return NextResponse.json(
        { message: 'No company associated with this user' },
        { status: 404 }
      );
    }
    
    // Check if user has admin role for their company
    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Forbidden: Insufficient permissions to update staff' },
        { status: 403 }
      );
    }
    
    // Extract staff ID from URL
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('id');
    
    if (!staffId) {
      return NextResponse.json(
        { message: 'Staff ID is required' },
        { status: 400 }
      );
    }
    
    // Find the staff member
    const staffMember = await User.findById(staffId);
    
    if (!staffMember) {
      return NextResponse.json(
        { message: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    // Check if staff member belongs to the same company
    if (staffMember.companyId.toString() !== currentUser.companyId.toString()) {
      return NextResponse.json(
        { message: 'Cannot update staff from another company' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { name, email, role, isActive } = body;
    
    // Validate role if it's provided
    if (role && role !== 'staff' && role !== 'admin') {
      return NextResponse.json(
        { message: 'Invalid role. Role must be either "staff" or "admin"' },
        { status: 400 }
      );
    }
    
    // Super admins can only be created by system processes
    if (role === 'superadmin') {
      return NextResponse.json(
        { message: 'Cannot assign superadmin role through this endpoint' },
        { status: 403 }
      );
    }
    
    // If email is changed, check if new email already exists
    if (email && email !== staffMember.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email is already in use by another user' },
          { status: 409 }
        );
      }
    }
    
    // Update the fields if provided
    if (name) staffMember.name = name;
    if (email) staffMember.email = email;
    if (role) staffMember.role = role;
    if (isActive !== undefined) staffMember.isActive = isActive;
    
    await staffMember.save();
    
    // Return the updated user without sensitive information
    const userResponse = {
      id: staffMember._id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      isActive: staffMember.isActive,
      updatedAt: staffMember.updatedAt
    };
    
    return NextResponse.json({
      message: 'Staff member updated successfully',
      data: userResponse
    });
    
  } catch (error: any) {
    console.error('Update staff error:', error);
    return NextResponse.json(
      { message: 'Failed to update staff member', error: error.message },
      { status: 500 }
    );
  }
} 