import mongoose, { Document, Schema } from 'mongoose';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  classInstanceId: mongoose.Types.ObjectId;
  bookingDate: Date;
  status: BookingStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  classInstanceId: {
    type: Schema.Types.ObjectId,
    ref: 'ClassInstance',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.CONFIRMED
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  cancelledAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ classId: 1 });
bookingSchema.index({ classInstanceId: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound index for unique booking per user per class instance
bookingSchema.index({ userId: 1, classInstanceId: 1 }, { unique: true });

export default mongoose.model<IBooking>('Booking', bookingSchema);
