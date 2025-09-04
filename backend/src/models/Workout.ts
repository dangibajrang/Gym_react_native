import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  restTime?: number; // in seconds
  notes?: string;
}

export interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration: number; // in minutes
  caloriesBurned?: number;
  exercises: IExercise[];
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sets: {
    type: Number,
    min: 0
  },
  reps: {
    type: Number,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  duration: {
    type: Number,
    min: 0
  },
  distance: {
    type: Number,
    min: 0
  },
  restTime: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

const WorkoutSchema = new Schema<IWorkout>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['cardio', 'strength', 'flexibility', 'sports', 'other']
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 1440 // 24 hours max
  },
  caloriesBurned: {
    type: Number,
    min: 0,
    max: 10000
  },
  exercises: [ExerciseSchema],
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
WorkoutSchema.index({ userId: 1, date: -1 });
WorkoutSchema.index({ userId: 1, type: 1 });
WorkoutSchema.index({ date: -1 });

// Virtual for formatted date
WorkoutSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for total exercises
WorkoutSchema.virtual('totalExercises').get(function() {
  return this.exercises.length;
});

// Pre-save middleware to calculate calories if not provided
WorkoutSchema.pre('save', function(next) {
  if (!this.caloriesBurned && this.duration) {
    // Basic calorie calculation based on workout type and duration
    const baseCaloriesPerMinute = {
      cardio: 10,
      strength: 6,
      flexibility: 3,
      sports: 8,
      other: 5
    };
    
    this.caloriesBurned = Math.round(
      baseCaloriesPerMinute[this.type] * this.duration
    );
  }
  next();
});

// Static method to get workout statistics
WorkoutSchema.statics.getWorkoutStats = async function(userId: string, startDate?: Date, endDate?: Date) {
  const matchQuery: any = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (startDate && endDate) {
    matchQuery.date = { $gte: startDate, $lte: endDate };
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: '$caloriesBurned' },
        averageDuration: { $avg: '$duration' },
        averageCalories: { $avg: '$caloriesBurned' }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0,
    averageDuration: 0,
    averageCalories: 0
  };
};

// Static method to get workouts by type
WorkoutSchema.statics.getWorkoutsByType = async function(userId: string, startDate?: Date, endDate?: Date) {
  const matchQuery: any = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (startDate && endDate) {
    matchQuery.date = { $gte: startDate, $lte: endDate };
  }

  return await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: '$caloriesBurned' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
