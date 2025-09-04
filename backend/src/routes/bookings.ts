import express from 'express';
import Booking from '../models/Booking';
import ClassInstance from '../models/ClassInstance';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Get all bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId, classId } = req.query;
    const query: any = {};

    // Build query filters
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (classId) query.classId = classId;

    const skip = (Number(page) - 1) * Number(limit);
    const bookings = await Booking.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('classId', 'name type duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      message: 'Bookings retrieved successfully',
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
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('classId', 'name type duration trainerId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { classId, classInstanceId, bookingDate } = req.body;
    const userId = req.user._id;

    // Check if class instance exists and has capacity
    const classInstance = await ClassInstance.findById(classInstanceId);
    if (!classInstance) {
      return res.status(404).json({
        success: false,
        message: 'Class instance not found'
      });
    }

    if (classInstance.bookedMembers.length >= classInstance.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Class is fully booked'
      });
    }

    // Check if user already has a booking for this class instance
    const existingBooking = await Booking.findOne({
      userId,
      classInstanceId,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a booking for this class'
      });
    }

    // Create booking
    const booking = new Booking({
      userId,
      classId,
      classInstanceId,
      bookingDate: new Date(bookingDate),
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    await booking.save();

    // Add user to class instance
    classInstance.bookedMembers.push(userId);
    await classInstance.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'firstName lastName email')
      .populate('classId', 'name type duration');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update booking status (Admin/Trainer only)
router.put('/:id/status', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['confirmed', 'cancelled', 'completed', 'no_show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'firstName lastName email')
     .populate('classId', 'name type duration');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel booking
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    if (booking.userId.toString() !== req.user._id.toString() && !['admin', 'trainer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }

    // Check cancellation policy
    const classInstance = await ClassInstance.findById(booking.classInstanceId);
    if (classInstance) {
      const hoursUntilClass = (new Date(classInstance.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60);
      if (hoursUntilClass < 24) { // Example: 24 hours cancellation policy
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel booking less than 24 hours before class'
        });
      }
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    await booking.save();

    // Remove user from class instance
    if (classInstance) {
      classInstance.bookedMembers = classInstance.bookedMembers.filter(
        (memberId: any) => memberId.toString() !== booking.userId.toString()
      );
      await classInstance.save();
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get booking statistics
router.get('/stats/overview', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const totalBookings = await Booking.countDocuments(query);
    const confirmedBookings = await Booking.countDocuments({ ...query, status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ ...query, status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ ...query, status: 'completed' });

    res.json({
      success: true,
      message: 'Booking statistics retrieved successfully',
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
