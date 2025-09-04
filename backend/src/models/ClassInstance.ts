import mongoose, { Document, Schema } from 'mongoose';

export interface IClassInstance extends Document {
  classId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  startTime: Date;
  endTime: Date;
  maxCapacity: number;
  currentBookings: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  actualStartTime?: Date;
  actualEndTime?: Date;
  notes?: string;
  attendance: {
    userId: mongoose.Types.ObjectId;
    checkInTime: Date;
    checkOutTime?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const classInstanceSchema = new Schema<IClassInstance>({
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  trainerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  attendance: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    checkInTime: {
      type: Date,
      required: true
    },
    checkOutTime: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Indexes
classInstanceSchema.index({ classId: 1 });
classInstanceSchema.index({ trainerId: 1 });
classInstanceSchema.index({ scheduledDate: 1 });
classInstanceSchema.index({ startTime: 1 });
classInstanceSchema.index({ status: 1 });
classInstanceSchema.index({ createdAt: -1 });

// Compound index for unique class instance per class per date/time
classInstanceSchema.index({ classId: 1, startTime: 1 }, { unique: true });

export default mongoose.model<IClassInstance>('ClassInstance', classInstanceSchema);
