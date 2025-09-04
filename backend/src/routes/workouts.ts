import express from 'express';
import Workout from '../models/Workout';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Get all workouts for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };

    // Build query filters
    if (type) query.type = type;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Workout.countDocuments(query);

    res.json({
      success: true,
      message: 'Workouts retrieved successfully',
      data: {
        workouts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get workout by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Workout retrieved successfully',
      data: workout
    });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create workout
router.post('/', authenticateToken, async (req, res) => {
  try {
    const workoutData = {
      ...req.body,
      userId: req.user._id
    };

    const workout = new Workout(workoutData);
    await workout.save();

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update workout
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: workout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete workout
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get workout progress/statistics
router.get('/progress/overview', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = { userId: req.user._id };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    // Get workout statistics
    const totalWorkouts = await Workout.countDocuments(query);
    const totalDuration = await Workout.aggregate([
      { $match: query },
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]);

    const totalCalories = await Workout.aggregate([
      { $match: query },
      { $group: { _id: null, totalCalories: { $sum: '$caloriesBurned' } } }
    ]);

    // Get workouts by type
    const workoutsByType = await Workout.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get recent workouts
    const recentWorkouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(5)
      .select('name type duration caloriesBurned date');

    res.json({
      success: true,
      message: 'Workout progress retrieved successfully',
      data: {
        totalWorkouts,
        totalDuration: totalDuration.length > 0 ? totalDuration[0].totalDuration : 0,
        totalCalories: totalCalories.length > 0 ? totalCalories[0].totalCalories : 0,
        workoutsByType,
        recentWorkouts
      }
    });
  } catch (error) {
    console.error('Get workout progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all workouts (Admin/Trainer only)
router.get('/admin/all', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, type, startDate, endDate } = req.query;
    const query: any = {};

    // Build query filters
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const workouts = await Workout.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Workout.countDocuments(query);

    res.json({
      success: true,
      message: 'All workouts retrieved successfully',
      data: {
        workouts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
