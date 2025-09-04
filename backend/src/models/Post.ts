import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  images?: string[];
  type: 'achievement' | 'workout' | 'motivation' | 'question' | 'general';
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const PostSchema = new Schema<IPost>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  images: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    required: true,
    enum: ['achievement', 'workout', 'motivation', 'question', 'general'],
    default: 'general'
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ type: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });

// Virtual for like count
PostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for formatted date
PostSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toISOString();
});

// Pre-save middleware to validate content
PostSchema.pre('save', function(next) {
  if (!this.content || this.content.trim().length === 0) {
    return next(new Error('Post content is required'));
  }
  
  if (this.content.length > 2000) {
    return next(new Error('Post content cannot exceed 2000 characters'));
  }
  
  next();
});

// Static method to get popular posts
PostSchema.statics.getPopularPosts = async function(limit: number = 10) {
  return await this.aggregate([
    {
      $addFields: {
        likeCount: { $size: '$likes' },
        commentCount: { $size: '$comments' },
        engagementScore: {
          $add: [
            { $multiply: [{ $size: '$likes' }, 1] },
            { $multiply: [{ $size: '$comments' }, 2] }
          ]
        }
      }
    },
    { $sort: { engagementScore: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          { $project: { firstName: 1, lastName: 1, profileImage: 1 } }
        ]
      }
    },
    { $unwind: '$user' }
  ]);
};

// Static method to get posts by type
PostSchema.statics.getPostsByType = async function(type: string, limit: number = 10) {
  return await this.find({ type })
    .populate('userId', 'firstName lastName profileImage')
    .populate('comments.userId', 'firstName lastName profileImage')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get user's posts
PostSchema.statics.getUserPosts = async function(userId: string, limit: number = 10) {
  return await this.find({ userId })
    .populate('userId', 'firstName lastName profileImage')
    .populate('comments.userId', 'firstName lastName profileImage')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance method to check if user liked the post
PostSchema.methods.isLikedBy = function(userId: string): boolean {
  return this.likes.some((likeId: mongoose.Types.ObjectId) => 
    likeId.toString() === userId.toString()
  );
};

// Instance method to add like
PostSchema.methods.addLike = function(userId: string): boolean {
  if (!this.isLikedBy(userId)) {
    this.likes.push(userId);
    return true;
  }
  return false;
};

// Instance method to remove like
PostSchema.methods.removeLike = function(userId: string): boolean {
  const initialLength = this.likes.length;
  this.likes = this.likes.filter((likeId: mongoose.Types.ObjectId) => 
    likeId.toString() !== userId.toString()
  );
  return this.likes.length < initialLength;
};

export default mongoose.model<IPost>('Post', PostSchema);
