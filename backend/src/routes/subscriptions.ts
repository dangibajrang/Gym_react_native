import express from 'express';
import Subscription from '../models/Subscription';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Get all subscriptions
router.get('/', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, plan } = req.query;
    const query: any = {};

    // Build query filters
    if (status) query.status = status;
    if (plan) query.plan = plan;

    const skip = (Number(page) - 1) * Number(limit);
    const subscriptions = await Subscription.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Subscription.countDocuments(query);

    res.json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: {
        subscriptions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get subscription by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('userId', 'firstName lastName email');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user can access this subscription
    if (subscription.userId._id.toString() !== req.user._id.toString() && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      message: 'Subscription retrieved successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get current user's subscription
router.get('/current/user', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user._id,
      status: { $in: ['active', 'pending'] }
    }).populate('userId', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Current subscription retrieved successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create subscription (Admin only)
router.post('/', authenticateToken, requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const subscription = new Subscription(req.body);
    await subscription.save();
    
    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: populatedSubscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update subscription
router.put('/:id', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel subscription
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user can cancel this subscription
    if (subscription.userId.toString() !== req.user._id.toString() && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own subscription'
      });
    }

    subscription.status = 'cancelled';
    subscription.cancellationReason = reason;
    subscription.cancellationDate = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get subscription statistics
router.get('/stats/overview', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const totalSubscriptions = await Subscription.countDocuments(query);
    const activeSubscriptions = await Subscription.countDocuments({ ...query, status: 'active' });
    const cancelledSubscriptions = await Subscription.countDocuments({ ...query, status: 'cancelled' });
    const expiredSubscriptions = await Subscription.countDocuments({ ...query, status: 'expired' });

    // Calculate total revenue
    const revenueResult = await Subscription.aggregate([
      { $match: query },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      message: 'Subscription statistics retrieved successfully',
      data: {
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        expiredSubscriptions,
        totalRevenue,
        cancellationRate: totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get expiring subscriptions
router.get('/expiring/list', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Number(days));

    const expiringSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lte: futureDate }
    })
    .populate('userId', 'firstName lastName email')
    .sort({ endDate: 1 });

    res.json({
      success: true,
      message: 'Expiring subscriptions retrieved successfully',
      data: expiringSubscriptions
    });
  } catch (error) {
    console.error('Get expiring subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
