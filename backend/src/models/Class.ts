import mongoose, { Document, Schema } from 'mongoose';

export enum ClassType {
  YOGA = 'yoga',
  PILATES = 'pilates',
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  CROSSFIT = 'crossfit',
  SPINNING = 'spinning',
  DANCE = 'dance',
  MARTIAL_ARTS = 'martial_arts',
  AQUA = 'aqua',
  PERSONAL_TRAINING = 'personal_training',
  GROUP_FITNESS = 'group_fitness'
}

export enum ClassStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled'
}

export interface IClass extends Document {
  name: string;
  description: string;
  type: ClassType;
  trainerId: mongoose.Types.ObjectId;
  maxCapacity: number;
  duration: number; // in minutes
  price: number;
  status: ClassStatus;
  schedule: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    isRecurring: boolean;
  }[];
  location: {
    room: string;
    floor?: number;
    building?: string;
  };
  requirements?: string[];
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image?: string;
  tags: string[];
  isBookable: boolean;
  cancellationPolicy: {
    hoursBeforeClass: number;
    refundPercentage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: Object.values(ClassType),
    required: true
  },
  trainerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 180
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(ClassStatus),
    default: ClassStatus.ACTIVE
  },
  schedule: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    isRecurring: {
      type: Boolean,
      default: true
    }
  }],
  location: {
    room: {
      type: String,
      required: true
    },
    floor: Number,
    building: String
  },
  requirements: [{
    type: String
  }],
  equipment: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  image: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  isBookable: {
    type: Boolean,
    default: true
  },
  cancellationPolicy: {
    hoursBeforeClass: {
      type: Number,
      default: 24
    },
    refundPercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// Indexes
classSchema.index({ type: 1 });
classSchema.index({ trainerId: 1 });
classSchema.index({ status: 1 });
classSchema.index({ 'schedule.dayOfWeek': 1 });
classSchema.index({ isBookable: 1 });
classSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IClass>('Class', classSchema);
