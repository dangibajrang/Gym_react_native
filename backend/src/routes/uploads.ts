import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';
import User from '../models/User';
import Post from '../models/Post';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Create subdirectories based on file type
    let subDir = 'general';
    if (file.fieldname === 'profileImage') {
      subDir = 'profiles';
    } else if (file.fieldname === 'postImages') {
      subDir = 'posts';
    } else if (file.fieldname === 'classImages') {
      subDir = 'classes';
    }
    
    const fullPath = path.join(uploadPath, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 5 // Max 5 files per request
  },
  fileFilter: fileFilter
});

// Upload profile image
router.post('/profile-image', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Delete old profile image if exists
    const user = await User.findById(req.user._id);
    if (user?.profileImage) {
      const oldImagePath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user profile image
    const imagePath = `/uploads/profiles/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, {
      profileImage: imagePath
    });

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imagePath: imagePath,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload post images
router.post('/post-images', authenticateToken, upload.array('postImages', 5), async (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files as Express.Multer.File[];
    const imagePaths = files.map(file => `/uploads/posts/${file.filename}`);

    res.json({
      success: true,
      message: 'Post images uploaded successfully',
      data: {
        imagePaths: imagePaths,
        filenames: files.map(file => file.filename)
      }
    });
  } catch (error) {
    console.error('Upload post images error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload class images (Admin/Trainer only)
router.post('/class-images', authenticateToken, requireRole([UserRole.ADMIN, UserRole.TRAINER]), upload.array('classImages', 3), async (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files as Express.Multer.File[];
    const imagePaths = files.map(file => `/uploads/classes/${file.filename}`);

    res.json({
      success: true,
      message: 'Class images uploaded successfully',
      data: {
        imagePaths: imagePaths,
        filenames: files.map(file => file.filename)
      }
    });
  } catch (error) {
    console.error('Upload class images error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete uploaded file
router.delete('/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'general' } = req.query;

    const filePath = path.join(process.cwd(), 'uploads', type as string, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user has permission to delete this file
    if (type === 'profiles') {
      const user = await User.findOne({ profileImage: `/uploads/profiles/${filename}` });
      if (!user || user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this file'
        });
      }
    }

    // Delete file
    fs.unlinkSync(filePath);

    // Update database if it's a profile image
    if (type === 'profiles') {
      await User.findByIdAndUpdate(req.user._id, {
        $unset: { profileImage: 1 }
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get file info
router.get('/info/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'general' } = req.query;

    const filePath = path.join(process.cwd(), 'uploads', type as string, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const stats = fs.statSync(filePath);

    res.json({
      success: true,
      message: 'File info retrieved successfully',
      data: {
        filename: filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        type: type
      }
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// List user's uploaded files
router.get('/my-files', authenticateToken, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const userFiles: any[] = [];

    // Get profile image
    if (type === 'all' || type === 'profiles') {
      const user = await User.findById(req.user._id);
      if (user?.profileImage) {
        const filename = path.basename(user.profileImage);
        const filePath = path.join(process.cwd(), 'uploads', 'profiles', filename);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          userFiles.push({
            filename: filename,
            type: 'profiles',
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: user.profileImage
          });
        }
      }
    }

    // Get post images
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({ userId: req.user._id, images: { $exists: true, $ne: [] } });
      for (const post of posts) {
        for (const imageUrl of post.images || []) {
          const filename = path.basename(imageUrl);
          const filePath = path.join(process.cwd(), 'uploads', 'posts', filename);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            userFiles.push({
              filename: filename,
              type: 'posts',
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime,
              url: imageUrl,
              postId: post._id
            });
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'User files retrieved successfully',
      data: userFiles
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cleanup orphaned files (Admin only)
router.post('/cleanup', authenticateToken, requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    let deletedCount = 0;

    // Cleanup profile images
    const profilesDir = path.join(uploadPath, 'profiles');
    if (fs.existsSync(profilesDir)) {
      const profileFiles = fs.readdirSync(profilesDir);
      for (const file of profileFiles) {
        const user = await User.findOne({ profileImage: `/uploads/profiles/${file}` });
        if (!user) {
          fs.unlinkSync(path.join(profilesDir, file));
          deletedCount++;
        }
      }
    }

    // Cleanup post images
    const postsDir = path.join(uploadPath, 'posts');
    if (fs.existsSync(postsDir)) {
      const postFiles = fs.readdirSync(postsDir);
      for (const file of postFiles) {
        const post = await Post.findOne({ images: { $in: [`/uploads/posts/${file}`] } });
        if (!post) {
          fs.unlinkSync(path.join(postsDir, file));
          deletedCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Cleanup completed. ${deletedCount} orphaned files deleted.`,
      data: { deletedCount }
    });
  } catch (error) {
    console.error('Cleanup files error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
