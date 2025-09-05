# 🏋️‍♂️ GymApp - Complete Gym Management Platform

A comprehensive gym management platform built with modern technologies, featuring a mobile app for members, web admin panel for management, and a robust backend API.

## 🌟 Features

### 📱 Mobile App (React Native + Expo)
- **User Authentication**: Secure login/register with JWT
- **Class Management**: Browse, search, and book fitness classes
- **Workout Tracking**: Log and track personal workouts
- **Social Features**: Create posts, interact with community
- **Subscription Management**: View and manage membership plans
- **Notifications**: Real-time updates and reminders
- **Profile Management**: Update personal information and preferences

### 💻 Web Admin Panel (React + Vite)
- **Dashboard**: Comprehensive analytics and metrics
- **User Management**: Manage members, trainers, and admins
- **Class Management**: Create, edit, and manage fitness classes
- **Booking Management**: View and manage class bookings
- **Subscription Management**: Handle membership plans and payments
- **Analytics**: Detailed reports and insights
- **Real-time Updates**: Live data synchronization

### 🔧 Backend API (Node.js + Express + MongoDB)
- **RESTful API**: Complete CRUD operations for all entities
- **Authentication & Authorization**: JWT-based with role-based access
- **Real-time Features**: Socket.io for live updates
- **Payment Integration**: Stripe for subscription management
- **AI Features**: Personalized recommendations and insights
- **File Upload**: Image and video handling
- **Advanced Analytics**: ML-powered insights and predictions
- **Wearable Integration**: Fitness tracker data synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Automated Setup
```bash
# Clone the repository
git clone <repository-url>
cd GymApp

# Run the setup script
./setup.sh
```

### Manual Setup

1. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Web Admin
cd ../web-admin
npm install

# Mobile App
cd ../mobile-app
npm install
```

2. **Environment Configuration**
```bash
# Copy environment templates
cp backend/env.example backend/.env
cp web-admin/env.example web-admin/.env
cp mobile-app/env.example mobile-app/.env

# Update with your configuration
```

3. **Database Setup**
```bash
# Start MongoDB (if local)
mongod

# Seed the database (optional)
cd backend
npm run seed
```

4. **Start Applications**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Web Admin (Terminal 2)
cd web-admin
npm run dev

# Mobile App (Terminal 3)
cd mobile-app
npm start
```

## 📁 Project Structure

```
GymApp/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Main server file
│   ├── uploads/             # File uploads
│   └── package.json
├── mobile-app/              # React Native + Expo
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── screens/         # App screens
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── package.json
├── web-admin/               # React + Vite
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Admin pages
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── package.json
├── shared/                  # Shared types and utilities
├── docs/                    # Documentation
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gymapp
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

### Web Admin Environment Variables
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=GymApp Admin
```

### Mobile App Environment Variables
```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_APP_NAME=GymApp
```

## 📊 Database Schema

### Core Models
- **User**: Members, trainers, admins with role-based access
- **Class**: Fitness classes with schedules and capacity
- **Booking**: Class reservations and attendance
- **Workout**: Personal workout tracking
- **Subscription**: Membership plans and billing
- **Post**: Social media features
- **Notification**: Real-time messaging

### Key Relationships
- Users can book multiple classes
- Classes have multiple bookings
- Users can have subscriptions
- Users can create posts and workouts

## 🔐 Authentication & Security

- **JWT-based Authentication**: Secure token-based auth
- **Role-based Access Control**: Admin, Trainer, Member roles
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin requests

## 💳 Payment Integration

- **Stripe Integration**: Secure payment processing
- **Subscription Management**: Automated billing cycles
- **Webhook Handling**: Real-time payment updates
- **Refund Processing**: Automated refund handling

## 🤖 AI Features

- **Personalized Recommendations**: AI-powered class suggestions
- **Workout Optimization**: Smart workout planning
- **Progress Tracking**: ML-based progress analysis
- **Predictive Analytics**: Member retention insights

## 📱 Mobile App Features

### Screens Implemented
- **Authentication**: Login, Register, Forgot Password
- **Dashboard**: Overview of activities and stats
- **Classes**: Browse, search, and book classes
- **Class Details**: Detailed class information
- **My Bookings**: Manage class reservations
- **Workouts**: Track personal workouts
- **Log Workout**: Add new workout sessions
- **Social**: Community posts and interactions
- **Profile**: User profile management
- **Settings**: App preferences and configuration

### Key Features
- **Offline Support**: Works without internet connection
- **Push Notifications**: Real-time updates
- **Dark Mode**: Theme customization
- **Accessibility**: Screen reader support
- **Performance**: Optimized for smooth experience

## 🖥️ Web Admin Features

### Pages Implemented
- **Dashboard**: Analytics and key metrics
- **Users**: Member and staff management
- **Classes**: Class creation and management
- **Bookings**: Reservation management
- **Subscriptions**: Membership plan management
- **Analytics**: Detailed reporting
- **Profile**: Admin profile management

### Key Features
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Works on all devices
- **Advanced Filtering**: Powerful search and filter options
- **Bulk Operations**: Mass data management
- **Export Features**: Data export capabilities

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Web admin tests
cd web-admin
npm test

# Mobile app tests
cd mobile-app
npm test
```

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
cd backend
npm run build

# Deploy to your preferred platform
# (Heroku, AWS, DigitalOcean, etc.)
```

### Web Admin Deployment
```bash
# Build for production
cd web-admin
npm run build

# Deploy to Vercel, Netlify, or your preferred platform
```

### Mobile App Deployment
```bash
# Build for production
cd mobile-app
expo build:android
expo build:ios

# Or use EAS Build
eas build --platform all
```

## 📈 Performance Optimization

- **Code Splitting**: Lazy loading for better performance
- **Image Optimization**: Compressed and optimized images
- **Caching**: Redis for API response caching
- **Database Indexing**: Optimized MongoDB queries
- **CDN Integration**: Fast content delivery

## 🔧 Development

### Code Style
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type safety across all projects
- **Husky**: Git hooks for code quality

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature

# Create pull request for review
```

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Development Guide](docs/DEVELOPMENT_GUIDE.md)
- [Advanced Features](docs/ADVANCED_FEATURES.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs and request features on GitHub
- **Documentation**: Check the docs folder for detailed guides
- **Community**: Join our Discord server for help and discussions

## 🎯 Roadmap

### Upcoming Features
- [ ] Video streaming for online classes
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Apple Watch integration
- [ ] Nutrition tracking
- [ ] Group challenges
- [ ] Live chat support

### Performance Improvements
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Advanced caching strategies
- [ ] Database optimization

## 🙏 Acknowledgments

- React Native and Expo teams
- Express.js and Node.js communities
- MongoDB and Mongoose teams
- Stripe for payment processing
- All open-source contributors

---

**Built with ❤️ by the GymApp Team**

For more information, visit our [documentation](docs/) or contact us at support@gymapp.com