import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Workout from '../models/Workout';
import User from '../models/User';
import Class from '../models/Class';
import Booking from '../models/Booking';

const router = express.Router();

// Get AI workout recommendations
router.get('/workout-recommendations', authenticateToken, async (req, res) => {
  try {
    const { goals, preferences, fitnessLevel, availableTime } = req.query;
    
    // Get user's workout history
    const userWorkouts = await Workout.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(20);

    // Get user's class booking history
    const userBookings = await Booking.find({ userId: req.user._id })
      .populate('classId')
      .sort({ date: -1 })
      .limit(20);

    // Analyze user's preferences and history
    const recommendations = await generateWorkoutRecommendations({
      user: req.user,
      workoutHistory: userWorkouts,
      classHistory: userBookings,
      goals: goals as string,
      preferences: preferences as string,
      fitnessLevel: fitnessLevel as string,
      availableTime: parseInt(availableTime as string) || 60
    });

    res.json({
      success: true,
      message: 'Workout recommendations generated successfully',
      data: recommendations
    });
  } catch (error) {
    console.error('Get workout recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get AI class recommendations
router.get('/class-recommendations', authenticateToken, async (req, res) => {
  try {
    const { timeSlot, dayOfWeek } = req.query;
    
    // Get user's class booking history
    const userBookings = await Booking.find({ userId: req.user._id })
      .populate('classId')
      .sort({ date: -1 })
      .limit(50);

    // Get available classes
    const availableClasses = await Class.find({ status: 'active' })
      .populate('trainerId', 'firstName lastName');

    // Generate class recommendations
    const recommendations = await generateClassRecommendations({
      user: req.user,
      classHistory: userBookings,
      availableClasses,
      timeSlot: timeSlot as string,
      dayOfWeek: dayOfWeek as string
    });

    res.json({
      success: true,
      message: 'Class recommendations generated successfully',
      data: recommendations
    });
  } catch (error) {
    console.error('Get class recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get personalized fitness insights
router.get('/fitness-insights', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user's workout data
    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Get user's class bookings
    const bookings = await Booking.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).populate('classId');

    // Generate insights
    const insights = await generateFitnessInsights({
      user: req.user,
      workouts,
      bookings,
      period: days
    });

    res.json({
      success: true,
      message: 'Fitness insights generated successfully',
      data: insights
    });
  } catch (error) {
    console.error('Get fitness insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get nutrition recommendations (placeholder for future implementation)
router.get('/nutrition-recommendations', authenticateToken, async (req, res) => {
  try {
    const { goals, dietaryRestrictions, activityLevel } = req.query;
    
    // This would integrate with a nutrition API or database
    const recommendations = {
      dailyCalories: calculateDailyCalories(req.user, activityLevel as string),
      macronutrients: {
        protein: '25-30%',
        carbohydrates: '45-50%',
        fats: '20-25%'
      },
      mealSuggestions: [
        'High-protein breakfast with eggs and vegetables',
        'Lean protein with complex carbs for lunch',
        'Light dinner with fish and salad'
      ],
      supplements: [
        'Whey protein for post-workout recovery',
        'Multivitamin for overall health',
        'Omega-3 for heart health'
      ]
    };

    res.json({
      success: true,
      message: 'Nutrition recommendations generated successfully',
      data: recommendations
    });
  } catch (error) {
    console.error('Get nutrition recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AI-powered workout plan generator
router.post('/generate-workout-plan', authenticateToken, async (req, res) => {
  try {
    const { goals, duration, frequency, equipment, experience } = req.body;
    
    const workoutPlan = await generateWorkoutPlan({
      user: req.user,
      goals: goals || 'general_fitness',
      duration: duration || 4, // weeks
      frequency: frequency || 3, // days per week
      equipment: equipment || 'gym',
      experience: experience || 'beginner'
    });

    res.json({
      success: true,
      message: 'Workout plan generated successfully',
      data: workoutPlan
    });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions for AI recommendations
async function generateWorkoutRecommendations(data: any) {
  const { user, workoutHistory, classHistory, goals, preferences, fitnessLevel, availableTime } = data;
  
  // Analyze workout patterns
  const workoutTypes = workoutHistory.map((w: any) => w.type);
  const mostCommonType = getMostCommon(workoutTypes);
  
  // Generate recommendations based on analysis
  const recommendations = [];
  
  // Cardio recommendations
  if (goals?.includes('weight_loss') || goals?.includes('endurance')) {
    recommendations.push({
      type: 'cardio',
      name: 'High-Intensity Interval Training',
      duration: Math.min(availableTime, 30),
      difficulty: fitnessLevel === 'beginner' ? 'easy' : 'moderate',
      description: 'Burn calories and improve cardiovascular health',
      exercises: [
        { name: 'Burpees', duration: 30, rest: 30 },
        { name: 'Mountain Climbers', duration: 30, rest: 30 },
        { name: 'Jump Squats', duration: 30, rest: 30 }
      ]
    });
  }
  
  // Strength recommendations
  if (goals?.includes('muscle_gain') || goals?.includes('strength')) {
    recommendations.push({
      type: 'strength',
      name: 'Full Body Strength Workout',
      duration: Math.min(availableTime, 45),
      difficulty: fitnessLevel === 'beginner' ? 'easy' : 'moderate',
      description: 'Build muscle and increase strength',
      exercises: [
        { name: 'Push-ups', sets: 3, reps: 10 },
        { name: 'Squats', sets: 3, reps: 15 },
        { name: 'Plank', duration: 60 }
      ]
    });
  }
  
  // Flexibility recommendations
  if (goals?.includes('flexibility') || preferences?.includes('yoga')) {
    recommendations.push({
      type: 'flexibility',
      name: 'Morning Stretch Routine',
      duration: Math.min(availableTime, 20),
      difficulty: 'easy',
      description: 'Improve flexibility and reduce muscle tension',
      exercises: [
        { name: 'Cat-Cow Stretch', duration: 60 },
        { name: 'Downward Dog', duration: 60 },
        { name: 'Child\'s Pose', duration: 60 }
      ]
    });
  }
  
  return recommendations;
}

async function generateClassRecommendations(data: any) {
  const { user, classHistory, availableClasses, timeSlot, dayOfWeek } = data;
  
  // Analyze class preferences
  const bookedClassTypes = classHistory.map((b: any) => b.classId?.type);
  const preferredTypes = getMostCommon(bookedClassTypes);
  
  // Filter classes based on preferences and availability
  let recommendedClasses = availableClasses.filter((c: any) => {
    // Check if class is available at requested time
    if (timeSlot && !c.schedule[dayOfWeek || 'monday']?.includes(timeSlot)) {
      return false;
    }
    
    // Check if user hasn't already booked this class recently
    const recentBooking = classHistory.find((b: any) => 
      b.classId?._id.toString() === c._id.toString() &&
      new Date(b.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    return !recentBooking;
  });
  
  // Sort by preference
  recommendedClasses.sort((a: any, b: any) => {
    const aScore = preferredTypes.includes(a.type) ? 1 : 0;
    const bScore = preferredTypes.includes(b.type) ? 1 : 0;
    return bScore - aScore;
  });
  
  return recommendedClasses.slice(0, 5); // Return top 5 recommendations
}

async function generateFitnessInsights(data: any) {
  const { user, workouts, bookings, period } = data;
  
  // Calculate workout frequency
  const workoutDays = new Set(workouts.map((w: any) => w.date.toDateString())).size;
  const frequency = (workoutDays / period) * 100;
  
  // Calculate total calories burned
  const totalCalories = workouts.reduce((sum: number, w: any) => sum + (w.caloriesBurned || 0), 0);
  
  // Calculate average workout duration
  const avgDuration = workouts.length > 0 
    ? workouts.reduce((sum: number, w: any) => sum + w.duration, 0) / workouts.length 
    : 0;
  
  // Analyze workout types
  const workoutTypes = workouts.reduce((acc: any, w: any) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});
  
  // Generate insights
  const insights = {
    period: `${period} days`,
    workoutFrequency: {
      days: workoutDays,
      percentage: Math.round(frequency),
      recommendation: frequency < 50 ? 'Try to work out more frequently' : 'Great consistency!'
    },
    caloriesBurned: {
      total: totalCalories,
      average: Math.round(totalCalories / Math.max(workoutDays, 1)),
      recommendation: totalCalories < 1000 ? 'Consider increasing workout intensity' : 'Excellent calorie burn!'
    },
    workoutTypes: {
      distribution: workoutTypes,
      recommendation: Object.keys(workoutTypes).length < 2 
        ? 'Try mixing different workout types' 
        : 'Good variety in your workouts!'
    },
    classParticipation: {
      total: bookings.length,
      average: Math.round(bookings.length / Math.max(workoutDays, 1) * 10) / 10,
      recommendation: bookings.length === 0 
        ? 'Consider joining some classes for variety' 
        : 'Great class participation!'
    },
    overallProgress: {
      score: Math.min(100, Math.round((frequency + (totalCalories / 100) + Object.keys(workoutTypes).length * 10) / 3)),
      recommendation: generateOverallRecommendation(frequency, totalCalories, Object.keys(workoutTypes).length)
    }
  };
  
  return insights;
}

async function generateWorkoutPlan(data: any) {
  const { user, goals, duration, frequency, equipment, experience } = data;
  
  const plan = {
    title: `${goals.replace('_', ' ').toUpperCase()} Workout Plan`,
    duration: `${duration} weeks`,
    frequency: `${frequency} days per week`,
    equipment: equipment,
    experience: experience,
    weeks: []
  };
  
  // Generate weekly plans
  for (let week = 1; week <= duration; week++) {
    const weekPlan = {
      week: week,
      days: []
    };
    
    // Generate daily workouts
    for (let day = 1; day <= frequency; day++) {
      const dayPlan = generateDayWorkout(goals, experience, equipment, week);
      weekPlan.days.push(dayPlan);
    }
    
    plan.weeks.push(weekPlan);
  }
  
  return plan;
}

function generateDayWorkout(goals: string, experience: string, equipment: string, week: number) {
  const workouts = {
    muscle_gain: {
      beginner: [
        { name: 'Push-ups', sets: 3, reps: 8 },
        { name: 'Squats', sets: 3, reps: 12 },
        { name: 'Plank', duration: 30 }
      ],
      intermediate: [
        { name: 'Bench Press', sets: 4, reps: 8 },
        { name: 'Deadlifts', sets: 4, reps: 6 },
        { name: 'Pull-ups', sets: 3, reps: 8 }
      ]
    },
    weight_loss: {
      beginner: [
        { name: 'Burpees', duration: 30, rest: 30 },
        { name: 'Jump Squats', duration: 30, rest: 30 },
        { name: 'Mountain Climbers', duration: 30, rest: 30 }
      ],
      intermediate: [
        { name: 'HIIT Circuit', duration: 20, rest: 10 },
        { name: 'Kettlebell Swings', sets: 3, reps: 15 },
        { name: 'Battle Ropes', duration: 30, rest: 30 }
      ]
    }
  };
  
  return {
    day: `Day ${week}`,
    focus: goals.replace('_', ' '),
    exercises: workouts[goals as keyof typeof workouts]?.[experience as keyof typeof workouts.muscle_gain] || workouts.muscle_gain.beginner,
    duration: 45,
    difficulty: experience
  };
}

function getMostCommon(arr: string[]) {
  const counts = arr.reduce((acc: any, item: string) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
}

function calculateDailyCalories(user: any, activityLevel: string) {
  // Basic BMR calculation (simplified)
  const baseCalories = 2000; // Base for average adult
  
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return Math.round(baseCalories * (multipliers[activityLevel as keyof typeof multipliers] || 1.55));
}

function generateOverallRecommendation(frequency: number, calories: number, variety: number) {
  if (frequency >= 70 && calories >= 1500 && variety >= 3) {
    return 'Outstanding progress! Keep up the excellent work!';
  } else if (frequency >= 50 && calories >= 1000 && variety >= 2) {
    return 'Great progress! Consider adding more variety to your workouts.';
  } else if (frequency >= 30 && calories >= 500) {
    return 'Good start! Try to increase your workout frequency and intensity.';
  } else {
    return 'Keep going! Every workout counts. Try to be more consistent.';
  }
}

export default router;
