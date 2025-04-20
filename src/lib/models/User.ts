'use server';

// Only import these on the server side
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// This file should only be imported from server components/actions
// Add 'use server' at the top to ensure it's not used in client components

export enum UserRole {
  ADMIN = 'admin',
  COMPANY = 'company',
  STAFF = 'staff',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

// Only create the model on the server
let User: Model<IUser>;

// Using a function to create the model ensures it's only executed on the server
function getModel() {
  if (mongoose.models.User) {
    return mongoose.models.User as Model<IUser>;
  }
  
  const UserSchema = new Schema<IUser>(
    {
      name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password should be at least 6 characters'],
      },
      role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.STAFF,
      },
      companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: function() {
          return this.role === UserRole.STAFF;
        },
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

  // Password hashing middleware
  UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error: unknown) {
      next(error as Error);
    }
  });

  // Method to compare passwords
  UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  };

  return mongoose.model<IUser>('User', UserSchema);
}

// Only execute getModel() on the server
if (typeof window === 'undefined') {
  User = getModel();
} else {
  // This part is just to satisfy TypeScript since we marked this file with 'use server'
  // It should never execute on the client due to 'use server' directive
  console.error('User model should not be imported on the client side');
  User = null as any;
}

export default User; 