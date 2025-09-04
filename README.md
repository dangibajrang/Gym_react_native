# 🏋️‍♂️ GymApp - Complete Gym Management System

A comprehensive gym management platform with mobile app for members and web admin panel for staff management.

## 🚀 Features

### 📱 Mobile App (React Native)
- **User Authentication**: Secure login/register with JWT
- **Class Booking**: Browse and book fitness classes
- **Workout Tracking**: Log workouts and track progress
- **Social Features**: Community feed and member interactions
- **Subscription Management**: View and manage membership plans
- **Push Notifications**: Class reminders and updates
- **Profile Management**: Update personal information and preferences

### 💻 Web Admin Panel (React.js)
- **Dashboard**: Real-time analytics and key metrics
- **User Management**: Manage members, trainers, and staff accounts
- **Class Management**: Create, edit, and schedule fitness classes
- **Booking Management**: View and manage class bookings
- **Subscription Management**: Handle membership plans and billing
- **Analytics**: Detailed reports and insights
- **Staff Management**: Role-based access control

### 🔧 Backend (Express.js + MongoDB)
- **RESTful API**: Complete API for all operations
- **Authentication**: JWT-based security with role-based access
- **Real-time Features**: Socket.io for live updates
- **Database**: MongoDB with Mongoose ODM
- **Security**: Rate limiting, CORS, helmet protection
- **File Upload**: Image and document handling

## 🏗️ Architecture

```
GymApp/
├── backend/           # Express.js API server
├── mobile-app/        # React Native mobile app
├── web-admin/         # React.js admin panel
├── shared/           # Shared types and utilities
└── docs/             # Documentation
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Socket.io** for real-time features
- **Multer** for file uploads
- **Helmet**, **CORS**, **Rate Limiting** for security

### Mobile App
- **React Native** with **Expo**
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Navigation** for routing
- **NativeWind** (Tailwind CSS) for styling
- **Expo SecureStore** for secure storage

### Web Admin
- **React.js** with **Vite**
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Router** for routing
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Recharts** for analytics

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Expo CLI (for mobile development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd GymApp
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
npm run dev
```

### 3. Mobile App Setup
```bash
cd mobile-app
npm install
npm start
# Use Expo Go app to scan QR code
```

### 4. Web Admin Setup
```bash
cd web-admin
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users (Admin/Staff)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/status` - Update user status

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create class (Admin/Trainer)
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class (Admin)
- `GET /api/classes/:id/bookings` - Get class bookings

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/stats/overview` - Get booking statistics

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions (Admin/Staff)
- `GET /api/subscriptions/current/user` - Get current user subscription
- `POST /api/subscriptions` - Create subscription (Admin)
- `PUT /api/subscriptions/:id` - Update subscription
- `PUT /api/subscriptions/:id/cancel` - Cancel subscription
- `GET /api/subscriptions/stats/overview` - Get subscription statistics

### Workouts
- `GET /api/workouts` - Get user workouts
- `POST /api/workouts` - Create workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `GET /api/workouts/progress/overview` - Get workout progress

### Social Features
- `GET /api/posts` - Get social feed
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment
- `GET /api/posts/user/:userId` - Get user posts

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/broadcast` - Broadcast notifications (Admin/Staff)

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md) - Complete API reference with examples
- [Development Guide](docs/DEVELOPMENT_GUIDE.md) - Development setup and guidelines
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Production deployment instructions

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/revenue` - Get revenue data
- `GET /api/analytics/classes` - Get class analytics
- `GET /api/analytics/members` - Get member analytics

## 🔐 Authentication & Authorization

### User Roles
- **Member**: Can book classes, track workouts, manage profile
- **Trainer**: Can create classes, view bookings, manage schedule
- **Staff**: Can manage users, view analytics, handle support
- **Admin**: Full access to all features and settings

### JWT Token Structure
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "member|trainer|staff|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 📊 Database Models

### User
- Personal information (name, email, phone, etc.)
- Role and status
- Profile image and preferences
- Emergency contact and medical conditions

### Class
- Class details (name, description, type, duration)
- Trainer assignment
- Schedule and capacity
- Location and requirements

### Booking
- User and class references
- Booking date and status
- Payment information
- Check-in/check-out times

### Subscription
- User and plan information
- Billing cycle and pricing
- Features and limitations
- Payment method and status

## 🎨 UI/UX Features

### Mobile App
- **Modern Design**: Clean, intuitive interface
- **Dark/Light Mode**: User preference support
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Real-time updates
- **Gesture Navigation**: Smooth user experience

### Web Admin
- **Responsive Design**: Works on all screen sizes
- **Dashboard Analytics**: Visual charts and metrics
- **Data Tables**: Sortable, filterable, paginated
- **Real-time Updates**: Live data synchronization
- **Role-based UI**: Different views for different roles

## 🔧 Development

### Code Structure
- **Modular Architecture**: Separated concerns
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management
- **Validation**: Input validation and sanitization
- **Testing**: Unit and integration tests

### Environment Variables
```bash
# Backend
PORT=3001
MONGODB_URI=mongodb://localhost:27017/gymapp
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Web Admin
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Gym Admin Panel
```

## 🚀 Deployment

### Backend (Railway/Render/Heroku)
1. Connect your repository
2. Set environment variables
3. Deploy automatically

### Mobile App (Expo)
1. Build with `expo build`
2. Submit to app stores
3. Use OTA updates for quick fixes

### Web Admin (Vercel/Netlify)
1. Connect repository
2. Set build settings
3. Deploy with automatic CI/CD

## 📈 Future Enhancements

### Planned Features
- **Payment Integration**: Stripe/PayPal support
- **AI Recommendations**: Personalized workout suggestions
- **Video Streaming**: Live and recorded classes
- **Wearable Integration**: Fitness tracker sync
- **Multi-language**: Internationalization support
- **Advanced Analytics**: Machine learning insights

### Scalability
- **Microservices**: Break down into smaller services
- **Caching**: Redis for performance
- **CDN**: Static asset delivery
- **Load Balancing**: Handle high traffic
- **Database Sharding**: Scale data storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## 🙏 Acknowledgments

- React Native and Expo teams
- Express.js and Node.js communities
- MongoDB and Mongoose documentation
- All contributors and testers

---

**Built with ❤️ for the fitness community**