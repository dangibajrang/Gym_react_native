import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';
import Class from '../models/Class';
import Booking from '../models/Booking';
import Subscription from '../models/Subscription';

const router = express.Router();

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const videoPath = path.join(uploadPath, 'videos');
    
    if (!fs.existsSync(videoPath)) {
      fs.mkdirSync(videoPath, { recursive: true });
    }
    
    cb(null, videoPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'video-' + uniqueSuffix + ext);
  }
});

const videoFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'));
  }
};

const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1
  },
  fileFilter: videoFilter
});

// Upload class video (Admin/Trainer only)
router.post('/upload', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const { classId, title, description, isLive = false } = req.body;

    // Verify class exists and user has permission
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (req.user.role === UserRole.TRAINER && classData.trainerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to upload videos for this class'
      });
    }

    const videoData = {
      classId,
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/videos/${req.file.filename}`,
      size: req.file.size,
      isLive: isLive === 'true',
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    // Update class with video information
    await Class.findByIdAndUpdate(classId, {
      $push: { videos: videoData }
    });

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: videoData
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get class videos
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user has access to this class
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check subscription for premium content
    const hasAccess = await checkVideoAccess(req.user._id, classData);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required to access this content'
      });
    }

    const videos = classData.videos || [];
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedVideos = videos.slice(startIndex, endIndex);

    res.json({
      success: true,
      message: 'Class videos retrieved successfully',
      data: {
        videos: paginatedVideos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: videos.length,
          totalPages: Math.ceil(videos.length / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get class videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stream video
router.get('/stream/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID is required'
      });
    }

    // Verify class and access
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const hasAccess = await checkVideoAccess(req.user._id, classData);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required to access this content'
      });
    }

    // Check if video exists in class
    const video = classData.videos?.find((v: any) => v.filename === filename);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const videoPath = path.join(process.cwd(), 'uploads', 'videos', filename);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    // Get video stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests for video streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Serve entire video
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get live classes
router.get('/live', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Find classes with live videos
    const liveClasses = await Class.find({
      status: 'active',
      'videos.isLive': true
    })
    .populate('trainerId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

    const total = await Class.countDocuments({
      status: 'active',
      'videos.isLive': true
    });

    res.json({
      success: true,
      message: 'Live classes retrieved successfully',
      data: {
        classes: liveClasses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get live classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start live stream (Admin/Trainer only)
router.post('/live/start', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const { classId, streamKey, title, description } = req.body;

    // Verify class exists and user has permission
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (req.user.role === UserRole.TRAINER && classData.trainerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to start live stream for this class'
      });
    }

    // Create live video entry
    const liveVideo = {
      classId,
      title: title || `${classData.name} - Live Stream`,
      description: description || 'Live class session',
      streamKey,
      isLive: true,
      status: 'live',
      startedAt: new Date(),
      startedBy: req.user._id
    };

    // Update class with live video
    await Class.findByIdAndUpdate(classId, {
      $push: { videos: liveVideo }
    });

    res.json({
      success: true,
      message: 'Live stream started successfully',
      data: liveVideo
    });
  } catch (error) {
    console.error('Start live stream error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// End live stream
router.post('/live/end', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const { classId, videoId } = req.body;

    // Find and update the live video
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const video = classData.videos?.find((v: any) => v._id.toString() === videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Update video status
    await Class.findOneAndUpdate(
      { _id: classId, 'videos._id': videoId },
      {
        $set: {
          'videos.$.isLive': false,
          'videos.$.status': 'ended',
          'videos.$.endedAt': new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Live stream ended successfully'
    });
  } catch (error) {
    console.error('End live stream error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete video (Admin/Trainer only)
router.delete('/:videoId', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const { videoId } = req.params;
    const { classId } = req.body;

    // Find the class and video
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const video = classData.videos?.find((v: any) => v._id.toString() === videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check permissions
    if (req.user.role === UserRole.TRAINER && 
        classData.trainerId.toString() !== req.user._id.toString() &&
        video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this video'
      });
    }

    // Delete video file
    const videoPath = path.join(process.cwd(), 'uploads', 'videos', video.filename);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    // Remove video from class
    await Class.findByIdAndUpdate(classId, {
      $pull: { videos: { _id: videoId } }
    });

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get video analytics (Admin/Trainer only)
router.get('/analytics/:videoId', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), async (req, res) => {
  try {
    const { videoId } = req.params;
    const { classId } = req.query;

    // This would typically come from a video analytics service
    // For now, we'll return mock data
    const analytics = {
      videoId,
      views: Math.floor(Math.random() * 1000),
      watchTime: Math.floor(Math.random() * 3600), // seconds
      completionRate: Math.floor(Math.random() * 100), // percentage
      engagement: {
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 20)
      },
      demographics: {
        ageGroups: {
          '18-24': Math.floor(Math.random() * 30),
          '25-34': Math.floor(Math.random() * 40),
          '35-44': Math.floor(Math.random() * 20),
          '45+': Math.floor(Math.random() * 10)
        },
        gender: {
          male: Math.floor(Math.random() * 60),
          female: Math.floor(Math.random() * 40)
        }
      }
    };

    res.json({
      success: true,
      message: 'Video analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Get video analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to check video access
async function checkVideoAccess(userId: string, classData: any) {
  // Check if user has active subscription
  const subscription = await Subscription.findOne({
    userId,
    status: 'active'
  });

  // Basic classes are free, premium classes require subscription
  if (classData.type === 'premium' && !subscription) {
    return false;
  }

  return true;
}

export default router;
