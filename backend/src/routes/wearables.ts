import express from 'express';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import Workout from '../models/Workout';

const router = express.Router();

// Connect wearable device
router.post('/connect', authenticateToken, async (req, res) => {
  try {
    const { deviceType, deviceId, accessToken, refreshToken } = req.body;

    // Validate device type
    const supportedDevices = ['fitbit', 'apple_watch', 'garmin', 'samsung_health', 'google_fit'];
    if (!supportedDevices.includes(deviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported device type'
      });
    }

    // Store device connection
    const deviceConnection = {
      deviceType,
      deviceId,
      accessToken,
      refreshToken,
      connectedAt: new Date(),
      isActive: true
    };

    await User.findByIdAndUpdate(req.user._id, {
      $push: { wearableDevices: deviceConnection }
    });

    res.json({
      success: true,
      message: 'Wearable device connected successfully',
      data: deviceConnection
    });
  } catch (error) {
    console.error('Connect wearable error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sync data from wearable device
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const { deviceType, dateRange } = req.body;
    const { startDate, endDate } = dateRange || {};

    // Find user's device connection
    const user = await User.findById(req.user._id);
    const device = user?.wearableDevices?.find((d: any) => d.deviceType === deviceType && d.isActive);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not connected or not found'
      });
    }

    // Sync data based on device type
    let syncedData;
    switch (deviceType) {
      case 'fitbit':
        syncedData = await syncFitbitData(device, startDate, endDate);
        break;
      case 'apple_watch':
        syncedData = await syncAppleWatchData(device, startDate, endDate);
        break;
      case 'garmin':
        syncedData = await syncGarminData(device, startDate, endDate);
        break;
      case 'samsung_health':
        syncedData = await syncSamsungHealthData(device, startDate, endDate);
        break;
      case 'google_fit':
        syncedData = await syncGoogleFitData(device, startDate, endDate);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported device type'
        });
    }

    // Save synced data as workouts
    const savedWorkouts = [];
    for (const activity of syncedData.activities) {
      const workout = new Workout({
        userId: req.user._id,
        name: activity.name,
        type: mapActivityType(activity.type),
        duration: activity.duration,
        caloriesBurned: activity.calories,
        date: activity.date,
        source: 'wearable',
        deviceType: deviceType,
        deviceData: activity.rawData
      });
      
      await workout.save();
      savedWorkouts.push(workout);
    }

    res.json({
      success: true,
      message: 'Data synced successfully',
      data: {
        activities: savedWorkouts,
        summary: syncedData.summary
      }
    });
  } catch (error) {
    console.error('Sync wearable data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get connected devices
router.get('/devices', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const devices = user?.wearableDevices?.filter((d: any) => d.isActive) || [];

    res.json({
      success: true,
      message: 'Connected devices retrieved successfully',
      data: devices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Disconnect device
router.delete('/disconnect/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $set: { 'wearableDevices.$[elem].isActive': false },
      $set: { 'wearableDevices.$[elem].disconnectedAt': new Date() }
    }, {
      arrayFilters: [{ 'elem.deviceId': deviceId }]
    });

    res.json({
      success: true,
      message: 'Device disconnected successfully'
    });
  } catch (error) {
    console.error('Disconnect device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get wearable data summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { period = '7' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get workouts from wearable devices
    const wearableWorkouts = await Workout.find({
      userId: req.user._id,
      source: 'wearable',
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Calculate summary statistics
    const summary = {
      period: `${days} days`,
      totalActivities: wearableWorkouts.length,
      totalDuration: wearableWorkouts.reduce((sum, w) => sum + w.duration, 0),
      totalCalories: wearableWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      averageDuration: wearableWorkouts.length > 0 
        ? Math.round(wearableWorkouts.reduce((sum, w) => sum + w.duration, 0) / wearableWorkouts.length)
        : 0,
      deviceBreakdown: getDeviceBreakdown(wearableWorkouts),
      activityTypes: getActivityTypeBreakdown(wearableWorkouts),
      dailyStats: getDailyStats(wearableWorkouts, days)
    };

    res.json({
      success: true,
      message: 'Wearable data summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    console.error('Get wearable summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Set up automatic sync
router.post('/auto-sync', authenticateToken, async (req, res) => {
  try {
    const { deviceType, enabled, frequency = 'daily' } = req.body;

    // Update user's auto-sync settings
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 
        'wearableDevices.$[elem].autoSync': {
          enabled,
          frequency,
          lastSync: new Date()
        }
      }
    }, {
      arrayFilters: [{ 'elem.deviceType': deviceType }]
    });

    res.json({
      success: true,
      message: 'Auto-sync settings updated successfully'
    });
  } catch (error) {
    console.error('Set auto-sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions for device-specific data syncing
async function syncFitbitData(device: any, startDate?: string, endDate?: string) {
  // Mock Fitbit API integration
  // In a real implementation, you would make API calls to Fitbit
  return {
    activities: [
      {
        name: 'Morning Run',
        type: 'running',
        duration: 1800, // 30 minutes
        calories: 300,
        date: new Date(),
        rawData: { steps: 5000, heartRate: 150 }
      },
      {
        name: 'Evening Walk',
        type: 'walking',
        duration: 1200, // 20 minutes
        calories: 150,
        date: new Date(),
        rawData: { steps: 3000, heartRate: 120 }
      }
    ],
    summary: {
      totalSteps: 8000,
      totalCalories: 450,
      activeMinutes: 50
    }
  };
}

async function syncAppleWatchData(device: any, startDate?: string, endDate?: string) {
  // Mock Apple Watch integration
  return {
    activities: [
      {
        name: 'HIIT Workout',
        type: 'hiit',
        duration: 2400, // 40 minutes
        calories: 400,
        date: new Date(),
        rawData: { heartRate: 160, rings: { move: 400, exercise: 40, stand: 12 } }
      }
    ],
    summary: {
      moveRing: 400,
      exerciseRing: 40,
      standRing: 12
    }
  };
}

async function syncGarminData(device: any, startDate?: string, endDate?: string) {
  // Mock Garmin integration
  return {
    activities: [
      {
        name: 'Cycling',
        type: 'cycling',
        duration: 3600, // 60 minutes
        calories: 500,
        date: new Date(),
        rawData: { distance: 25, speed: 25, heartRate: 140 }
      }
    ],
    summary: {
      totalDistance: 25,
      averageSpeed: 25,
      totalCalories: 500
    }
  };
}

async function syncSamsungHealthData(device: any, startDate?: string, endDate?: string) {
  // Mock Samsung Health integration
  return {
    activities: [
      {
        name: 'Yoga Session',
        type: 'yoga',
        duration: 2700, // 45 minutes
        calories: 200,
        date: new Date(),
        rawData: { heartRate: 100, stress: 'low' }
      }
    ],
    summary: {
      totalCalories: 200,
      averageHeartRate: 100,
      stressLevel: 'low'
    }
  };
}

async function syncGoogleFitData(device: any, startDate?: string, endDate?: string) {
  // Mock Google Fit integration
  return {
    activities: [
      {
        name: 'Weight Training',
        type: 'strength_training',
        duration: 2700, // 45 minutes
        calories: 350,
        date: new Date(),
        rawData: { heartRate: 130, reps: 150 }
      }
    ],
    summary: {
      totalCalories: 350,
      totalReps: 150,
      averageHeartRate: 130
    }
  };
}

function mapActivityType(deviceActivityType: string): string {
  const typeMapping: { [key: string]: string } = {
    'running': 'cardio',
    'walking': 'cardio',
    'cycling': 'cardio',
    'swimming': 'cardio',
    'hiit': 'cardio',
    'strength_training': 'strength',
    'weight_training': 'strength',
    'yoga': 'flexibility',
    'pilates': 'flexibility',
    'stretching': 'flexibility'
  };

  return typeMapping[deviceActivityType] || 'other';
}

function getDeviceBreakdown(workouts: any[]) {
  const breakdown: { [key: string]: number } = {};
  workouts.forEach(workout => {
    const deviceType = workout.deviceType || 'unknown';
    breakdown[deviceType] = (breakdown[deviceType] || 0) + 1;
  });
  return breakdown;
}

function getActivityTypeBreakdown(workouts: any[]) {
  const breakdown: { [key: string]: number } = {};
  workouts.forEach(workout => {
    const type = workout.type || 'other';
    breakdown[type] = (breakdown[type] || 0) + 1;
  });
  return breakdown;
}

function getDailyStats(workouts: any[], days: number) {
  const dailyStats = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayWorkouts = workouts.filter(w => 
      w.date.toDateString() === date.toDateString()
    );
    
    dailyStats.push({
      date: date.toISOString().split('T')[0],
      activities: dayWorkouts.length,
      duration: dayWorkouts.reduce((sum, w) => sum + w.duration, 0),
      calories: dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
    });
  }
  
  return dailyStats.reverse();
}

export default router;
