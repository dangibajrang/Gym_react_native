# GymApp Development Guide

## Project Overview

GymApp is a comprehensive gym management platform consisting of:

- **Backend API**: Express.js + MongoDB + TypeScript
- **Mobile App**: React Native + Expo + TypeScript
- **Web Admin Panel**: React.js + Vite + TypeScript

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Web Admin      │    │   Backend API   │
│  (React Native) │    │   (React.js)    │    │   (Express.js)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    MongoDB      │
                    │   (Database)    │
                    └─────────────────┘
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas)
- Git
- VS Code (recommended)
- Expo CLI (for mobile development)

### Initial Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd GymApp
```

2. **Install dependencies for all projects:**
```bash
# Backend
cd backend && npm install && cd ..

# Mobile App
cd mobile-app && npm install && cd ..

# Web Admin
cd web-admin && npm install && cd ..
```

3. **Set up environment variables:**
```bash
# Copy example files
cp backend/.env.example backend/.env
cp web-admin/.env.example web-admin/.env
cp mobile-app/.env.example mobile-app/.env
```

4. **Start MongoDB:**
```bash
# Local MongoDB
brew services start mongodb-community
# or
sudo systemctl start mongod
```

## Backend Development

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.ts        # Main server file
├── uploads/             # File uploads
├── logs/                # Application logs
├── package.json
├── tsconfig.json
└── .env
```

### Key Technologies

- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Socket.io**: Real-time communication
- **TypeScript**: Type safety

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### API Development

#### Creating New Routes

1. **Create route file:**
```typescript
// src/routes/example.ts
import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

export default router;
```

2. **Register route in server.ts:**
```typescript
import exampleRoutes from './routes/example';
app.use('/api/example', exampleRoutes);
```

#### Creating New Models

```typescript
// src/models/Example.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IExample extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExampleSchema = new Schema<IExample>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IExample>('Example', ExampleSchema);
```

### Database Development

#### Mongoose Schemas

- Use TypeScript interfaces for type safety
- Add validation rules
- Create indexes for performance
- Use virtuals for computed properties
- Implement pre/post hooks for business logic

#### Database Indexes

```typescript
// Add indexes for better performance
UserSchema.index({ email: 1 });
ClassSchema.index({ type: 1, status: 1 });
BookingSchema.index({ userId: 1, date: -1 });
```

### Authentication & Authorization

#### JWT Implementation

```typescript
// Middleware for protecting routes
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid token' });
  }
};
```

#### Role-Based Access Control

```typescript
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};
```

## Mobile App Development

### Project Structure

```
mobile-app/
├── src/
│   ├── components/      # Reusable components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation setup
│   ├── store/           # Redux store
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   └── types/           # TypeScript types
├── assets/              # Images, fonts, etc.
├── App.tsx
├── package.json
└── app.json
```

### Key Technologies

- **React Native**: Mobile framework
- **Expo**: Development platform
- **Redux Toolkit**: State management
- **React Navigation**: Navigation
- **NativeWind**: Tailwind CSS for React Native
- **TypeScript**: Type safety

### Development Commands

```bash
# Start Expo development server
npx expo start

# Start with specific platform
npx expo start --android
npx expo start --ios

# Build for development
npx expo build:android
npx expo build:ios

# Run on device
npx expo run:android
npx expo run:ios
```

### Component Development

#### Screen Components

```typescript
// src/screens/ExampleScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useAppSelector } from '../hooks/redux';

const ExampleScreen: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">Welcome, {user?.firstName}!</Text>
    </View>
  );
};

export default ExampleScreen;
```

#### Custom Components

```typescript
// src/components/ExampleComponent.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ExampleComponentProps {
  title: string;
  onPress: () => void;
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="p-4 bg-blue-500 rounded-lg">
      <Text className="text-white text-center font-semibold">{title}</Text>
    </TouchableOpacity>
  );
};

export default ExampleComponent;
```

### State Management

#### Redux Slices

```typescript
// src/store/slices/exampleSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exampleService } from '../../services/exampleService';

interface ExampleState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ExampleState = {
  items: [],
  loading: false,
  error: null
};

export const fetchExamples = createAsyncThunk(
  'example/fetchExamples',
  async () => {
    const response = await exampleService.getExamples();
    return response.data;
  }
);

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamples.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamples.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchExamples.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      });
  }
});

export const { clearError } = exampleSlice.actions;
export default exampleSlice.reducer;
```

### API Integration

#### Service Layer

```typescript
// src/services/exampleService.ts
import { api } from './api';

export const exampleService = {
  getExamples: () => api.get('/examples'),
  getExample: (id: string) => api.get(`/examples/${id}`),
  createExample: (data: any) => api.post('/examples', data),
  updateExample: (id: string, data: any) => api.put(`/examples/${id}`, data),
  deleteExample: (id: string) => api.delete(`/examples/${id}`)
};
```

## Web Admin Development

### Project Structure

```
web-admin/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── store/           # Redux store
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   └── types/           # TypeScript types
├── public/              # Static assets
├── index.html
├── package.json
└── vite.config.ts
```

### Key Technologies

- **React**: UI library
- **Vite**: Build tool
- **Redux Toolkit**: State management
- **React Router**: Routing
- **Tailwind CSS**: Styling
- **Headless UI**: Accessible components
- **TypeScript**: Type safety

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Component Development

#### Page Components

```typescript
// src/pages/ExamplePage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchExamples } from '../store/slices/exampleSlice';

const ExamplePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.example);

  useEffect(() => {
    dispatch(fetchExamples());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Examples</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamplePage;
```

#### Reusable Components

```typescript
// src/components/Button.tsx
import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
```

## Testing

### Backend Testing

```typescript
// tests/auth.test.ts
import request from 'supertest';
import app from '../src/server';

describe('Authentication', () => {
  test('POST /api/auth/register', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Testing

```typescript
// src/components/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Code Quality

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Git Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Performance Optimization

### Backend Optimization

1. **Database Indexing**
2. **Query Optimization**
3. **Caching with Redis**
4. **Compression Middleware**
5. **Rate Limiting**

### Frontend Optimization

1. **Code Splitting**
2. **Lazy Loading**
3. **Image Optimization**
4. **Bundle Analysis**
5. **Memoization**

## Security Best Practices

### Backend Security

1. **Input Validation**
2. **SQL Injection Prevention**
3. **XSS Protection**
4. **CSRF Protection**
5. **Rate Limiting**
6. **Secure Headers**

### Frontend Security

1. **XSS Prevention**
2. **Secure API Calls**
3. **Input Sanitization**
4. **Content Security Policy**

## Deployment

### Development Deployment

1. **Local Development**: Use `npm run dev`
2. **Docker Development**: Use Docker Compose
3. **Staging Environment**: Deploy to staging server

### Production Deployment

1. **Backend**: Deploy to cloud provider (AWS, DigitalOcean, etc.)
2. **Frontend**: Deploy to CDN (Vercel, Netlify, etc.)
3. **Database**: Use managed database service (MongoDB Atlas)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in configuration
2. **Database connection**: Check MongoDB status
3. **Build errors**: Clear cache and reinstall dependencies
4. **Type errors**: Check TypeScript configuration

### Debugging

1. **Backend**: Use console.log and debugger
2. **Frontend**: Use React DevTools and browser dev tools
3. **Mobile**: Use Expo DevTools and device logs

## Contributing

### Git Workflow

1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Make changes**: Implement feature with tests
3. **Commit changes**: `git commit -m "Add new feature"`
4. **Push branch**: `git push origin feature/new-feature`
5. **Create pull request**: Submit PR for review

### Code Review Process

1. **Automated checks**: CI/CD pipeline runs tests
2. **Peer review**: Team members review code
3. **Testing**: Manual testing of features
4. **Documentation**: Update relevant documentation

This development guide provides comprehensive information for developing and maintaining the GymApp project across all three components.
