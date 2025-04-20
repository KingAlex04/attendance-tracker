import mongoose, { Schema, Document, Model } from 'mongoose';

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  date: Date;
  checkIn: {
    time: Date;
    location: {
      lat: number;
      lng: number;
    };
  };
  checkOut?: {
    time: Date;
    location: {
      lat: number;
      lng: number;
    };
  };
  locationLogs: LocationPoint[];
  workingHours?: number;
  status: 'present' | 'absent' | 'late';
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const locationPointSchema = new Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      time: {
        type: Date,
        required: true,
      },
      location: {
        type: locationSchema,
        required: true,
      },
    },
    checkOut: {
      time: {
        type: Date,
      },
      location: {
        type: locationSchema,
      },
    },
    locationLogs: [locationPointSchema],
    workingHours: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for userId and date to ensure a user can only have one attendance record per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.models.Attendance as Model<IAttendance> || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance; 