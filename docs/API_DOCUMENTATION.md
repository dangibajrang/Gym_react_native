# GymApp API Documentation

## Overview

The GymApp API is a comprehensive RESTful API built with Express.js and MongoDB, designed to support both a mobile app for gym members and a web admin panel for gym staff.

## Base URL

```
http://localhost:3001/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": {}, // Response data (if any)
  "error": "Error message" // Only present on errors
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## API Endpoints

### Authentication

#### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "MEMBER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "MEMBER"
    },
    "token": "jwt_token"
  }
}
```

#### Login User
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Profile
```
GET /auth/profile
```

#### Update User Profile
```
PUT /auth/profile
```

#### Change Password
```
PUT /auth/change-password
```

### Users Management (Admin Only)

#### Get All Users
```
GET /users?page=1&limit=10&role=MEMBER&status=active
```

#### Get User by ID
```
GET /users/:id
```

#### Update User
```
PUT /users/:id
```

#### Delete User
```
DELETE /users/:id
```

### Classes Management

#### Get All Classes
```
GET /classes?page=1&limit=10&type=cardio&status=active
```

#### Get Class by ID
```
GET /classes/:id
```

#### Create Class (Admin/Trainer)
```
POST /classes
```

**Request Body:**
```json
{
  "name": "Morning Yoga",
  "description": "Relaxing morning yoga session",
  "type": "flexibility",
  "trainerId": "trainer_id",
  "duration": 60,
  "capacity": 20,
  "price": 15.00,
  "schedule": {
    "monday": ["09:00", "18:00"],
    "tuesday": ["09:00"],
    "wednesday": ["09:00", "18:00"]
  }
}
```

#### Update Class
```
PUT /classes/:id
```

#### Update Class Status
```
PUT /classes/:id/status
```

#### Delete Class (Admin Only)
```
DELETE /classes/:id
```

#### Get Class Bookings
```
GET /classes/:id/bookings?date=2024-01-15
```

### Bookings Management

#### Get All Bookings
```
GET /bookings?page=1&limit=10&status=confirmed&userId=user_id
```

#### Get Booking by ID
```
GET /bookings/:id
```

#### Create Booking
```
POST /bookings
```

**Request Body:**
```json
{
  "classId": "class_id",
  "classInstanceId": "instance_id",
  "date": "2024-01-15"
}
```

#### Update Booking Status
```
PUT /bookings/:id/status
```

#### Cancel Booking
```
PUT /bookings/:id/cancel
```

#### Get Booking Statistics
```
GET /bookings/stats/overview?startDate=2024-01-01&endDate=2024-01-31
```

### Subscriptions Management

#### Get All Subscriptions
```
GET /subscriptions?page=1&limit=10&status=active&plan=premium
```

#### Get Subscription by ID
```
GET /subscriptions/:id
```

#### Get Current User's Subscription
```
GET /subscriptions/current/user
```

#### Create Subscription (Admin Only)
```
POST /subscriptions
```

**Request Body:**
```json
{
  "userId": "user_id",
  "plan": "premium",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "price": 99.99
}
```

#### Update Subscription
```
PUT /subscriptions/:id
```

#### Cancel Subscription
```
PUT /subscriptions/:id/cancel
```

#### Get Subscription Statistics
```
GET /subscriptions/stats/overview?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Expiring Subscriptions
```
GET /subscriptions/expiring/list?days=30
```

### Workouts Management

#### Get User Workouts
```
GET /workouts?page=1&limit=10&type=cardio&startDate=2024-01-01&endDate=2024-01-31
```

#### Get Workout by ID
```
GET /workouts/:id
```

#### Create Workout
```
POST /workouts
```

**Request Body:**
```json
{
  "name": "Morning Run",
  "type": "cardio",
  "duration": 30,
  "caloriesBurned": 300,
  "exercises": [
    {
      "name": "Running",
      "duration": 1800,
      "distance": 5000
    }
  ],
  "notes": "Great run today!"
}
```

#### Update Workout
```
PUT /workouts/:id
```

#### Delete Workout
```
DELETE /workouts/:id
```

#### Get Workout Progress
```
GET /workouts/progress/overview?startDate=2024-01-01&endDate=2024-01-31
```

#### Get All Workouts (Admin/Trainer)
```
GET /workouts/admin/all?page=1&limit=10&userId=user_id&type=cardio
```

### Social Features (Posts)

#### Get Social Feed
```
GET /posts?page=1&limit=10&type=achievement
```

#### Get Post by ID
```
GET /posts/:id
```

#### Create Post
```
POST /posts
```

**Request Body:**
```json
{
  "content": "Just completed my first 5K run! 🏃‍♂️",
  "type": "achievement",
  "images": ["image_url_1", "image_url_2"]
}
```

#### Update Post
```
PUT /posts/:id
```

#### Delete Post
```
DELETE /posts/:id
```

#### Like/Unlike Post
```
POST /posts/:id/like
```

#### Add Comment
```
POST /posts/:id/comments
```

**Request Body:**
```json
{
  "content": "Great job! Keep it up!"
}
```

#### Delete Comment
```
DELETE /posts/:postId/comments/:commentId
```

#### Get User's Posts
```
GET /posts/user/:userId?page=1&limit=10
```

### Notifications

#### Get User Notifications
```
GET /notifications?page=1&limit=20&unreadOnly=true
```

#### Get Notification by ID
```
GET /notifications/:id
```

#### Mark Notification as Read
```
PUT /notifications/:id/read
```

#### Mark All Notifications as Read
```
PUT /notifications/read-all
```

#### Delete Notification
```
DELETE /notifications/:id
```

#### Clear All Notifications
```
DELETE /notifications/clear-all
```

#### Create Notification (Admin/Staff)
```
POST /notifications
```

#### Broadcast Notifications (Admin/Staff)
```
POST /notifications/broadcast
```

**Request Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2"],
  "title": "Gym Maintenance",
  "message": "The gym will be closed for maintenance on Sunday",
  "type": "system"
}
```

#### Get Notification Statistics (Admin/Staff)
```
GET /notifications/stats/overview?startDate=2024-01-01&endDate=2024-01-31
```

### Analytics (Admin/Staff Only)

#### Get Dashboard Statistics
```
GET /analytics/dashboard
```

#### Get User Growth
```
GET /analytics/user-growth?period=month
```

## Data Models

### User
```typescript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  firstName: string,
  lastName: string,
  role: 'MEMBER' | 'TRAINER' | 'ADMIN' | 'STAFF',
  status: 'active' | 'inactive' | 'suspended',
  profileImage?: string,
  phone?: string,
  dateOfBirth?: Date,
  address?: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Class
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other',
  trainerId: ObjectId,
  duration: number, // in minutes
  capacity: number,
  price: number,
  schedule: {
    monday?: string[],
    tuesday?: string[],
    wednesday?: string[],
    thursday?: string[],
    friday?: string[],
    saturday?: string[],
    sunday?: string[]
  },
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  classId: ObjectId,
  classInstanceId: ObjectId,
  date: Date,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  paymentStatus: 'pending' | 'paid' | 'refunded',
  cancellationReason?: string,
  cancelledAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  plan: 'basic' | 'premium' | 'unlimited',
  startDate: Date,
  endDate: Date,
  price: number,
  status: 'active' | 'cancelled' | 'expired' | 'pending',
  stripeSubscriptionId?: string,
  cancellationReason?: string,
  cancelledAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Workout
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other',
  duration: number, // in minutes
  caloriesBurned?: number,
  exercises: [{
    name: string,
    sets?: number,
    reps?: number,
    weight?: number,
    duration?: number,
    distance?: number,
    restTime?: number,
    notes?: string
  }],
  notes?: string,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Post
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  content: string,
  images?: string[],
  type: 'achievement' | 'workout' | 'motivation' | 'question' | 'general',
  likes: ObjectId[],
  comments: [{
    userId: ObjectId,
    content: string,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Notification
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  title: string,
  message: string,
  type: 'booking' | 'class' | 'subscription' | 'payment' | 'achievement' | 'reminder' | 'general' | 'system',
  isRead: boolean,
  readAt?: Date,
  data?: any,
  createdAt: Date,
  updatedAt: Date
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **File upload endpoints**: 10 requests per 15 minutes per IP

## WebSocket Events

The API supports real-time features via Socket.io:

### Client Events
- `join-room`: Join a user-specific room for notifications
- `leave-room`: Leave a user-specific room

### Server Events
- `new-notification`: New notification received
- `booking-update`: Booking status updated
- `class-cancelled`: Class cancelled notification

## Error Handling

All errors are handled consistently with appropriate HTTP status codes and descriptive error messages. Common error scenarios:

1. **Validation Errors**: 400 status with field-specific error details
2. **Authentication Errors**: 401 status with authentication failure message
3. **Authorization Errors**: 403 status with permission denied message
4. **Not Found Errors**: 404 status with resource not found message
5. **Server Errors**: 500 status with generic error message

## Pagination

Most list endpoints support pagination:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

- **Filtering**: Use query parameters to filter results
- **Sorting**: Use `sort` parameter (e.g., `sort=-createdAt` for newest first)
- **Search**: Use `search` parameter for text-based searches

## File Uploads

File uploads are handled via multipart/form-data:

- **Profile Images**: Max 5MB, supported formats: JPG, PNG, GIF
- **Post Images**: Max 10MB per image, max 5 images per post
- **Documents**: Max 20MB, supported formats: PDF, DOC, DOCX

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt with salt rounds
3. **Rate Limiting**: Prevents API abuse
4. **CORS**: Configurable cross-origin resource sharing
5. **Helmet**: Security headers
6. **Input Validation**: Comprehensive request validation
7. **SQL Injection Protection**: MongoDB with parameterized queries
8. **XSS Protection**: Input sanitization and output encoding
