import express from 'express';
import Class from '../models/Class';
import ClassInstance from '../models/ClassInstance';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Get all classes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    const query: any = {};

    // Build query filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const classes = await Class.find(query)
      .populate('trainerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Class.countDocuments(query);

    res.json({
      success: true,
      message: 'Classes retrieved successfully',
      data: {
        classes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get class by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('trainerId', 'firstName lastName email');
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Class retrieved successfully',
      data: classData
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create class (Admin/Trainer only)
router.post('/', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const classData = new Class(req.body);
    await classData.save();
    
    const populatedClass = await Class.findById(classData._id)
      .populate('trainerId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: populatedClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update class (Admin/Trainer only)
router.put('/:id', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('trainerId', 'firstName lastName email');
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classData
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update class status
router.put('/:id/status', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('trainerId', 'firstName lastName email');
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Class status updated successfully',
      data: classData
    });
  } catch (error) {
    console.error('Update class status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete class (Admin only)
router.delete('/:id', authenticateToken, requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const classData = await Class.findByIdAndDelete(req.params.id);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get class bookings
router.get('/:id/bookings', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const { page = 1, limit = 10, date } = req.query;
    const query: any = { classId: req.params.id };
    
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.bookingDate = { $gte: startDate, $lt: endDate };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const bookings = await ClassInstance.find(query)
      .populate('bookedMembers', 'firstName lastName email')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ClassInstance.countDocuments(query);

    res.json({
      success: true,
      message: 'Class bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get class bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
