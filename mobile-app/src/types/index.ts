// User Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  role: 'member' | 'trainer' | 'admin' | 'staff';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  profileImage?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  fitnessGoals?: string[];
  medicalConditions?: string[];
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Class Types
export interface Class {
  _id: string;
  name: string;
  description: string;
  type: 'yoga' | 'pilates' | 'cardio' | 'strength' | 'crossfit' | 'spinning' | 'dance' | 'martial_arts' | 'aqua' | 'personal_training' | 'group_fitness';
  trainerId: string;
  trainer?: User;
  maxCapacity: number;
  duration: number;
  price: number;
  status: 'active' | 'inactive' | 'cancelled';
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
  }[];
  location: {
    room: string;
    floor?: number;
    building?: string;
  };
  requirements?: string[];
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image?: string;
  tags: string[];
  isBookable: boolean;
  cancellationPolicy: {
    hoursBeforeClass: number;
    refundPercentage: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  _id: string;
  userId: string;
  classId: string;
  classInstanceId: string;
  class?: Class;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export interface Subscription {
  _id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'vip' | 'unlimited';
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending';
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  price: number;
  features: {
    maxClassesPerMonth: number;
    personalTrainingSessions: number;
    accessToAllClasses: boolean;
    priorityBooking: boolean;
    guestPasses: number;
    lockerAccess: boolean;
    towelService: boolean;
    nutritionConsultation: boolean;
  };
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'cash';
    last4?: string;
    brand?: string;
  };
  autoRenew: boolean;
  nextBillingDate?: string;
  cancellationDate?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Workout Types
export interface Workout {
  _id: string;
  userId: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration: number; // in minutes
  caloriesBurned?: number;
  exercises: Exercise[];
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  restTime?: number; // in seconds
  notes?: string;
}

// Post Types (Social Feed)
export interface Post {
  _id: string;
  userId: string;
  user?: User;
  content: string;
  images?: string[];
  type: 'achievement' | 'workout' | 'motivation' | 'question' | 'general';
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Classes: undefined;
  ClassDetails: { classId: string };
  BookClass: { classId: string; classInstanceId: string };
  MyBookings: undefined;
  Workouts: undefined;
  LogWorkout: undefined;
  WorkoutDetails: { workoutId: string };
  Profile: undefined;
  EditProfile: undefined;
  Subscription: undefined;
  Social: undefined;
  PostDetails: { postId: string };
  CreatePost: undefined;
  Notifications: undefined;
  Settings: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Redux State Types
export interface RootState {
  auth: AuthState;
  classes: {
    classes: Class[];
    myBookings: Booking[];
    isLoading: boolean;
  };
  workouts: {
    workouts: Workout[];
    isLoading: boolean;
  };
  social: {
    posts: Post[];
    isLoading: boolean;
  };
  subscription: {
    currentSubscription: Subscription | null;
    plans: Subscription[];
    isLoading: boolean;
  };
}
