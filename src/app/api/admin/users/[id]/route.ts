import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/lib/models/User';
import { isAdmin } from '@/lib/utils/auth';

// Get a specific user by ID
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
    
    const userId = params.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('companyId', 'name');
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
    
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user', error: error.message },
      { status: 500 }
    );
  }
}

// Update a user
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
    
    const userId = params.id;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await req.json();
    const { name, email, password, role, companyId, isActive } = body;
    
    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      updateData.role = role;
    }
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    // Update companyId if role is STAFF or COMPANY and companyId is provided
    if ((role === UserRole.STAFF || role === UserRole.COMPANY || user.role === UserRole.STAFF || user.role === UserRole.COMPANY) && companyId) {
      updateData.companyId = companyId;
    }
    
    // If role is changed to ADMIN, remove companyId
    if (role === UserRole.ADMIN) {
      updateData.companyId = undefined;
    }
    
    // Check if email is changed and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');
    
    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
    
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: 'Failed to update user', error: error.message },
      { status: 500 }
    );
  }
}

// Delete a user
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
    
    const userId = params.id;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete user (soft delete by setting isActive to false)
    user.isActive = false;
    await user.save();
    
    return NextResponse.json({
      message: 'User deleted successfully',
    });
    
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: 'Failed to delete user', error: error.message },
      { status: 500 }
    );
  }
} 