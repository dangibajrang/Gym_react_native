import express from 'express';
import User from '../models/User';
import Class from '../models/Class';
import Booking from '../models/Booking';
import Subscription from '../models/Subscription';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    // Get basic counts
    const totalMembers = await User.countDocuments({ role: UserRole.MEMBER });
    const totalTrainers = await User.countDocuments({ role: UserRole.TRAINER });
    const totalClasses = await Class.countDocuments({ status: 'active' });
    const totalBookings = await Booking.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

    // Calculate monthly revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyRevenueResult = await Subscription.aggregate([
      {
        $match: {
          status: 'active',
          createdAt: { $gte: currentMonth, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].totalRevenue : 0;

    // Calculate class occupancy rate
    const classInstances = await Booking.aggregate([
      {
        $group: {
          _id: '$classId',
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    const totalClassBookings = classInstances.reduce((sum, instance) => sum + instance.totalBookings, 0);
    const averageOccupancy = totalClasses > 0 ? (totalClassBookings / totalClasses) : 0;

    // Calculate member retention rate (simplified)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newMembersThisMonth = await User.countDocuments({
      role: UserRole.MEMBER,
      createdAt: { $gte: currentMonth, $lt: nextMonth }
    });

    const memberRetentionRate = totalMembers > 0 ? ((totalMembers - newMembersThisMonth) / totalMembers) * 100 : 0;

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        totalMembers,
        totalTrainers,
        totalClasses,
        totalBookings,
        activeSubscriptions,
        monthlyRevenue,
        classOccupancyRate: Math.round(averageOccupancy * 100) / 100,
        memberRetentionRate: Math.round(memberRetentionRate * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get revenue data
router.get('/revenue', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { startDate, endDate, period = 'monthly' } = req.query;
    
    let groupBy: any = {};
    let dateFormat = '%Y-%m';
    
    if (period === 'daily') {
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      dateFormat = '%Y-%m-%d';
    } else if (period === 'weekly') {
      groupBy = { $dateToString: { format: '%Y-W%U', date: '$createdAt' } };
      dateFormat = '%Y-W%U';
    } else {
      groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      dateFormat = '%Y-%m';
    }

    const matchQuery: any = { status: 'active' };
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const revenueData = await Subscription.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$price' },
          subscriptions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedData = revenueData.map(item => ({
      period: item._id,
      revenue: item.revenue,
      subscriptions: item.subscriptions
    }));

    res.json({
      success: true,
      message: 'Revenue data retrieved successfully',
      data: formattedData
    });
  } catch (error) {
    console.error('Get revenue data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get class analytics
router.get('/classes', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery: any = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const classAnalytics = await Booking.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      { $unwind: '$classInfo' },
      {
        $group: {
          _id: '$classId',
          className: { $first: '$classInfo.name' },
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          averageOccupancy: {
            $divide: ['$confirmedBookings', { $ifNull: ['$totalBookings', 1] }]
          }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    const formattedData = classAnalytics.map(item => ({
      classId: item._id,
      className: item.className,
      totalBookings: item.totalBookings,
      averageOccupancy: Math.round(item.averageOccupancy * 100) / 100,
      revenue: 0, // This would need to be calculated based on class pricing
      rating: 0 // This would need to be calculated from reviews
    }));

    res.json({
      success: true,
      message: 'Class analytics retrieved successfully',
      data: formattedData
    });
  } catch (error) {
    console.error('Get class analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get member analytics
router.get('/members', authenticateToken, requireRole([UserRole.ADMIN, UserRole.STAFF]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery: any = { role: UserRole.MEMBER };
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const totalMembers = await User.countDocuments(matchQuery);
    const activeMembers = await User.countDocuments({ ...matchQuery, status: 'active' });
    const newMembers = await User.countDocuments({
      ...matchQuery,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Get member activity (bookings in last 30 days)
    const activeMembersCount = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: '$userId',
          bookingCount: { $sum: 1 }
        }
      },
      {
        $count: 'activeMembers'
      }
    ]);

    const activeMembersWithBookings = activeMembersCount.length > 0 ? activeMembersCount[0].activeMembers : 0;

    res.json({
      success: true,
      message: 'Member analytics retrieved successfully',
      data: {
        totalMembers,
        activeMembers,
        newMembers,
        activeMembersWithBookings,
        memberEngagementRate: totalMembers > 0 ? (activeMembersWithBookings / totalMembers) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get member analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
