import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';
import User from '../models/User';
import Workout from '../models/Workout';
import Booking from '../models/Booking';
import Subscription from '../models/Subscription';
import Class from '../models/Class';

const router = express.Router();

// Get member retention prediction
router.get('/retention-prediction', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    // Get user data for analysis
    const users = await User.find({ role: UserRole.MEMBER })
      .populate('subscriptions')
      .populate('workouts')
      .populate('bookings');

    // Calculate retention risk scores
    const retentionAnalysis = await calculateRetentionRisk(users, days);

    res.json({
      success: true,
      message: 'Retention prediction generated successfully',
      data: retentionAnalysis
    });
  } catch (error) {
    console.error('Get retention prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get class popularity prediction
router.get('/class-popularity', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { timeHorizon = '7' } = req.query;
    const days = parseInt(timeHorizon as string);

    // Get class booking data
    const classes = await Class.find({ status: 'active' })
      .populate('trainerId', 'firstName lastName');

    const bookings = await Booking.find({
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Predict class popularity
    const popularityPredictions = await predictClassPopularity(classes, bookings, days);

    res.json({
      success: true,
      message: 'Class popularity prediction generated successfully',
      data: popularityPredictions
    });
  } catch (error) {
    console.error('Get class popularity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get personalized recommendations for users
router.get('/user-recommendations/:userId', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('workouts')
      .populate('bookings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(user);

    res.json({
      success: true,
      message: 'User recommendations generated successfully',
      data: recommendations
    });
  } catch (error) {
    console.error('Get user recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get revenue forecasting
router.get('/revenue-forecast', authenticateToken, requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const { period = '90' } = req.query;
    const days = parseInt(period as string);

    // Get historical revenue data
    const subscriptions = await Subscription.find({
      createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
    });

    // Generate revenue forecast
    const revenueForecast = await generateRevenueForecast(subscriptions, days);

    res.json({
      success: true,
      message: 'Revenue forecast generated successfully',
      data: revenueForecast
    });
  } catch (error) {
    console.error('Get revenue forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get churn analysis
router.get('/churn-analysis', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { period = '90' } = req.query;
    const days = parseInt(period as string);

    // Get user activity data
    const users = await User.find({ role: UserRole.MEMBER });
    const workouts = await Workout.find({
      date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    });
    const bookings = await Booking.find({
      date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    });

    // Analyze churn patterns
    const churnAnalysis = await analyzeChurnPatterns(users, workouts, bookings, days);

    res.json({
      success: true,
      message: 'Churn analysis generated successfully',
      data: churnAnalysis
    });
  } catch (error) {
    console.error('Get churn analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get optimal class scheduling recommendations
router.get('/optimal-scheduling', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    // Get class and booking data
    const classes = await Class.find({ status: 'active' });
    const bookings = await Booking.find({
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Generate scheduling recommendations
    const schedulingRecommendations = await generateOptimalScheduling(classes, bookings);

    res.json({
      success: true,
      message: 'Optimal scheduling recommendations generated successfully',
      data: schedulingRecommendations
    });
  } catch (error) {
    console.error('Get optimal scheduling error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get member engagement scoring
router.get('/engagement-scores', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get member data
    const members = await User.find({ role: UserRole.MEMBER })
      .limit(Number(limit));

    // Calculate engagement scores
    const engagementScores = await calculateEngagementScores(members);

    res.json({
      success: true,
      message: 'Engagement scores generated successfully',
      data: engagementScores
    });
  } catch (error) {
    console.error('Get engagement scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions for ML analytics
async function calculateRetentionRisk(users: any[], days: number) {
  const riskScores = [];
  
  for (const user of users) {
    const score = await calculateUserRetentionRisk(user, days);
    riskScores.push({
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      riskScore: score.risk,
      riskLevel: score.level,
      factors: score.factors,
      recommendations: score.recommendations
    });
  }

  // Sort by risk score (highest risk first)
  riskScores.sort((a, b) => b.riskScore - a.riskScore);

  return {
    totalMembers: users.length,
    highRisk: riskScores.filter(s => s.riskLevel === 'high').length,
    mediumRisk: riskScores.filter(s => s.riskLevel === 'medium').length,
    lowRisk: riskScores.filter(s => s.riskLevel === 'low').length,
    members: riskScores
  };
}

async function calculateUserRetentionRisk(user: any, days: number) {
  const factors = [];
  let riskScore = 0;

  // Check last activity
  const lastWorkout = await Workout.findOne({ userId: user._id }).sort({ date: -1 });
  const lastBooking = await Booking.findOne({ userId: user._id }).sort({ date: -1 });
  
  const daysSinceActivity = Math.min(
    lastWorkout ? Math.floor((Date.now() - lastWorkout.date.getTime()) / (1000 * 60 * 60 * 24)) : 999,
    lastBooking ? Math.floor((Date.now() - lastBooking.date.getTime()) / (1000 * 60 * 60 * 24)) : 999
  );

  if (daysSinceActivity > 14) {
    riskScore += 40;
    factors.push('No activity in 14+ days');
  } else if (daysSinceActivity > 7) {
    riskScore += 20;
    factors.push('Low activity (7+ days)');
  }

  // Check subscription status
  const activeSubscription = await Subscription.findOne({
    userId: user._id,
    status: 'active'
  });

  if (!activeSubscription) {
    riskScore += 30;
    factors.push('No active subscription');
  } else {
    // Check subscription age
    const subscriptionAge = Math.floor((Date.now() - activeSubscription.startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (subscriptionAge < 7) {
      riskScore += 15;
      factors.push('New member (high churn risk)');
    }
  }

  // Check workout frequency
  const workoutCount = await Workout.countDocuments({
    userId: user._id,
    date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  if (workoutCount < 2) {
    riskScore += 25;
    factors.push('Low workout frequency');
  }

  // Check class participation
  const bookingCount = await Booking.countDocuments({
    userId: user._id,
    date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  if (bookingCount === 0) {
    riskScore += 20;
    factors.push('No class participation');
  }

  // Determine risk level
  let riskLevel = 'low';
  if (riskScore >= 70) riskLevel = 'high';
  else if (riskScore >= 40) riskLevel = 'medium';

  // Generate recommendations
  const recommendations = [];
  if (daysSinceActivity > 7) {
    recommendations.push('Send re-engagement email with special offers');
  }
  if (!activeSubscription) {
    recommendations.push('Offer discounted membership or trial');
  }
  if (workoutCount < 2) {
    recommendations.push('Provide personalized workout recommendations');
  }
  if (bookingCount === 0) {
    recommendations.push('Invite to free trial classes');
  }

  return {
    risk: riskScore,
    level: riskLevel,
    factors,
    recommendations
  };
}

async function predictClassPopularity(classes: any[], bookings: any[], days: number) {
  const predictions = [];

  for (const classItem of classes) {
    // Calculate historical booking rate
    const classBookings = bookings.filter(b => b.classId.toString() === classItem._id.toString());
    const avgBookings = classBookings.length / 30; // Average per day over 30 days

    // Predict future popularity based on trends
    const popularityScore = calculatePopularityScore(classItem, classBookings);
    const predictedBookings = Math.round(avgBookings * days * popularityScore);

    predictions.push({
      classId: classItem._id,
      className: classItem.name,
      trainer: `${classItem.trainerId.firstName} ${classItem.trainerId.lastName}`,
      currentPopularity: popularityScore,
      predictedBookings: predictedBookings,
      confidence: calculateConfidence(classBookings.length),
      recommendations: generateClassRecommendations(classItem, popularityScore)
    });
  }

  return predictions.sort((a, b) => b.predictedBookings - a.predictedBookings);
}

function calculatePopularityScore(classItem: any, bookings: any[]) {
  let score = 0.5; // Base score

  // Factor in class type popularity
  const typeScores = {
    'cardio': 0.8,
    'strength': 0.7,
    'flexibility': 0.6,
    'sports': 0.5,
    'other': 0.4
  };
  score += typeScores[classItem.type] || 0.4;

  // Factor in booking trends
  if (bookings.length > 20) score += 0.2;
  else if (bookings.length > 10) score += 0.1;

  // Factor in capacity utilization
  const avgUtilization = bookings.length / (classItem.capacity * 30);
  if (avgUtilization > 0.8) score += 0.2;
  else if (avgUtilization > 0.6) score += 0.1;

  return Math.min(1.0, score);
}

function calculateConfidence(bookingCount: number) {
  if (bookingCount > 50) return 'high';
  if (bookingCount > 20) return 'medium';
  return 'low';
}

function generateClassRecommendations(classItem: any, popularityScore: number) {
  const recommendations = [];

  if (popularityScore < 0.4) {
    recommendations.push('Consider changing class time or type');
    recommendations.push('Offer promotional pricing');
    recommendations.push('Improve class description and marketing');
  } else if (popularityScore > 0.8) {
    recommendations.push('Consider adding more sessions');
    recommendations.push('Increase class capacity if possible');
    recommendations.push('Use as a model for other classes');
  }

  return recommendations;
}

async function generatePersonalizedRecommendations(user: any) {
  const recommendations = {
    workoutRecommendations: [],
    classRecommendations: [],
    nutritionRecommendations: [],
    engagementRecommendations: []
  };

  // Analyze user's workout patterns
  const workouts = await Workout.find({ userId: user._id }).sort({ date: -1 }).limit(20);
  const bookings = await Booking.find({ userId: user._id }).sort({ date: -1 }).limit(20);

  // Workout recommendations
  const workoutTypes = workouts.map(w => w.type);
  const mostCommonType = getMostCommon(workoutTypes);
  
  if (mostCommonType === 'cardio') {
    recommendations.workoutRecommendations.push('Try strength training to build muscle');
  } else if (mostCommonType === 'strength') {
    recommendations.workoutRecommendations.push('Add cardio workouts for better endurance');
  }

  // Class recommendations
  const bookedClassTypes = bookings.map(b => b.classId?.type).filter(Boolean);
  const uniqueClassTypes = [...new Set(bookedClassTypes)];
  
  if (uniqueClassTypes.length < 2) {
    recommendations.classRecommendations.push('Try different class types for variety');
  }

  // Engagement recommendations
  const daysSinceLastActivity = workouts.length > 0 
    ? Math.floor((Date.now() - workouts[0].date.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  if (daysSinceLastActivity > 3) {
    recommendations.engagementRecommendations.push('Set a workout reminder for tomorrow');
  }

  return recommendations;
}

async function generateRevenueForecast(subscriptions: any[], days: number) {
  // Calculate historical revenue trends
  const monthlyRevenue = {};
  subscriptions.forEach(sub => {
    const month = sub.createdAt.toISOString().substring(0, 7);
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + sub.price;
  });

  // Simple trend analysis (in production, use more sophisticated ML models)
  const months = Object.keys(monthlyRevenue).sort();
  const revenues = months.map(month => monthlyRevenue[month]);
  
  // Calculate growth rate
  const growthRate = revenues.length > 1 
    ? (revenues[revenues.length - 1] - revenues[0]) / revenues[0]
    : 0;

  // Forecast future revenue
  const currentRevenue = revenues[revenues.length - 1] || 0;
  const forecastedRevenue = currentRevenue * (1 + growthRate * (days / 30));

  return {
    currentMonthlyRevenue: currentRevenue,
    forecastedRevenue: Math.round(forecastedRevenue),
    growthRate: Math.round(growthRate * 100),
    confidence: revenues.length > 6 ? 'high' : 'medium',
    factors: {
      subscriptionCount: subscriptions.length,
      averageSubscriptionValue: subscriptions.length > 0 
        ? subscriptions.reduce((sum, s) => sum + s.price, 0) / subscriptions.length
        : 0
    }
  };
}

async function analyzeChurnPatterns(users: any[], workouts: any[], bookings: any[], days: number) {
  const churnedUsers = [];
  const atRiskUsers = [];

  for (const user of users) {
    const userWorkouts = workouts.filter(w => w.userId.toString() === user._id.toString());
    const userBookings = bookings.filter(b => b.userId.toString() === user._id.toString());
    
    const lastActivity = Math.max(
      userWorkouts.length > 0 ? userWorkouts[0].date.getTime() : 0,
      userBookings.length > 0 ? userBookings[0].date.getTime() : 0
    );

    const daysSinceActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));

    if (daysSinceActivity > 30) {
      churnedUsers.push(user);
    } else if (daysSinceActivity > 14) {
      atRiskUsers.push(user);
    }
  }

  return {
    totalUsers: users.length,
    churnedUsers: churnedUsers.length,
    atRiskUsers: atRiskUsers.length,
    churnRate: Math.round((churnedUsers.length / users.length) * 100),
    riskRate: Math.round((atRiskUsers.length / users.length) * 100),
    patterns: {
      averageDaysToChurn: calculateAverageDaysToChurn(churnedUsers),
      commonChurnFactors: identifyChurnFactors(churnedUsers),
      retentionStrategies: generateRetentionStrategies(atRiskUsers)
    }
  };
}

function calculateAverageDaysToChurn(churnedUsers: any[]) {
  // This would be calculated based on historical data
  return 45; // Mock value
}

function identifyChurnFactors(churnedUsers: any[]) {
  return [
    'Low workout frequency',
    'No class participation',
    'Inactive subscription',
    'Poor customer service experience'
  ];
}

function generateRetentionStrategies(atRiskUsers: any[]) {
  return [
    'Send personalized re-engagement emails',
    'Offer special promotions',
    'Provide free personal training sessions',
    'Improve customer support response time'
  ];
}

async function generateOptimalScheduling(classes: any[], bookings: any[]) {
  const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const recommendations = [];

  for (const day of daysOfWeek) {
    for (const time of timeSlots) {
      const existingClasses = classes.filter(c => c.schedule[day]?.includes(time));
      const bookingsAtTime = bookings.filter(b => {
        const bookingTime = new Date(b.date).toTimeString().substring(0, 5);
        return bookingTime === time;
      });

      const utilization = bookingsAtTime.length / (existingClasses.length * 20); // Assuming 20 capacity per class

      if (utilization > 0.8 && existingClasses.length < 3) {
        recommendations.push({
          day,
          time,
          recommendation: 'Add more classes',
          reason: 'High demand, low supply',
          priority: 'high'
        });
      } else if (utilization < 0.3 && existingClasses.length > 1) {
        recommendations.push({
          day,
          time,
          recommendation: 'Reduce class frequency',
          reason: 'Low utilization',
          priority: 'medium'
        });
      }
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

async function calculateEngagementScores(members: any[]) {
  const scores = [];

  for (const member of members) {
    const workouts = await Workout.countDocuments({ userId: member._id });
    const bookings = await Booking.countDocuments({ userId: member._id });
    const subscription = await Subscription.findOne({ userId: member._id, status: 'active' });

    // Calculate engagement score (0-100)
    let score = 0;
    score += Math.min(30, workouts * 2); // Up to 30 points for workouts
    score += Math.min(25, bookings * 3); // Up to 25 points for class bookings
    score += subscription ? 20 : 0; // 20 points for active subscription
    score += member.isEmailVerified ? 10 : 0; // 10 points for verified email
    score += member.profileImage ? 15 : 0; // 15 points for profile picture

    scores.push({
      userId: member._id,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      engagementScore: score,
      level: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
      factors: {
        workouts,
        bookings,
        hasActiveSubscription: !!subscription,
        isEmailVerified: member.isEmailVerified,
        hasProfileImage: !!member.profileImage
      }
    });
  }

  return scores.sort((a, b) => b.engagementScore - a.engagementScore);
}

function getMostCommon(arr: string[]) {
  const counts = arr.reduce((acc: any, item: string) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
}

export default router;
