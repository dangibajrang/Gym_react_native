import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'booking' | 'class' | 'subscription' | 'payment' | 'achievement' | 'reminder' | 'general' | 'system';
  isRead: boolean;
  readAt?: Date;
  data?: any; // Additional data for the notification
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['booking', 'class', 'subscription', 'payment', 'achievement', 'reminder', 'general', 'system'],
    default: 'general'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  data: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

// Virtual for formatted date
NotificationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toISOString();
});

// Virtual for time ago
NotificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - this.createdAt.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to create notification
NotificationSchema.statics.createNotification = async function(
  userId: string,
  title: string,
  message: string,
  type: string = 'general',
  data?: any
) {
  const notification = new this({
    userId,
    title,
    message,
    type,
    data
  });
  
  return await notification.save();
};

// Static method to create multiple notifications
NotificationSchema.statics.createBulkNotifications = async function(
  notifications: Array<{
    userId: string;
    title: string;
    message: string;
    type?: string;
    data?: any;
  }>
) {
  const notificationDocs = notifications.map(notif => ({
    userId: notif.userId,
    title: notif.title,
    message: notif.message,
    type: notif.type || 'general',
    data: notif.data
  }));
  
  return await this.insertMany(notificationDocs);
};

// Static method to get unread count for user
NotificationSchema.statics.getUnreadCount = async function(userId: string) {
  return await this.countDocuments({ userId, isRead: false });
};

// Static method to mark all as read for user
NotificationSchema.statics.markAllAsRead = async function(userId: string) {
  return await this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get notifications by type
NotificationSchema.statics.getByType = async function(
  userId: string,
  type: string,
  limit: number = 10
) {
  return await this.find({ userId, type })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to cleanup old notifications
NotificationSchema.statics.cleanupOldNotifications = async function(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Instance method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

export default mongoose.model<INotification>('Notification', NotificationSchema);
