import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip',
  UNLIMITED = 'unlimited'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: Date;
  endDate: Date;
  price: number;
  features: {
    maxClassesPerMonth: number;
    personalTrainingSessions: number;
    accessToAllClasses: boolean;
    priorityBooking: boolean;
    guestPasses: number;
    lockerAccess: boolean;
    towelService: boolean;
    nutritionConsultation: boolean;
  };
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'cash';
    last4?: string;
    brand?: string;
  };
  autoRenew: boolean;
  nextBillingDate?: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: Object.values(SubscriptionPlan),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.PENDING
  },
  billingCycle: {
    type: String,
    enum: Object.values(BillingCycle),
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  features: {
    maxClassesPerMonth: {
      type: Number,
      default: 0
    },
    personalTrainingSessions: {
      type: Number,
      default: 0
    },
    accessToAllClasses: {
      type: Boolean,
      default: false
    },
    priorityBooking: {
      type: Boolean,
      default: false
    },
    guestPasses: {
      type: Number,
      default: 0
    },
    lockerAccess: {
      type: Boolean,
      default: false
    },
    towelService: {
      type: Boolean,
      default: false
    },
    nutritionConsultation: {
      type: Boolean,
      default: false
    }
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'bank_transfer', 'cash'],
      required: true
    },
    last4: String,
    brand: String
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  nextBillingDate: {
    type: Date
  },
  cancellationDate: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ startDate: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
