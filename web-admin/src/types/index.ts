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
  user?: User;
  classId: string;
  class?: Class;
  classInstanceId: string;
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
  user?: User;
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

// Analytics Types
export interface DashboardStats {
  totalMembers: number;
  totalTrainers: number;
  totalClasses: number;
  totalBookings: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  classOccupancyRate: number;
  memberRetentionRate: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
  classes: number;
}

export interface ClassAnalytics {
  classId: string;
  className: string;
  totalBookings: number;
  averageOccupancy: number;
  revenue: number;
  rating: number;
}

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

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Redux State Types
export interface RootState {
  auth: AuthState;
  users: {
    users: User[];
    isLoading: boolean;
    error: string | null;
  };
  classes: {
    classes: Class[];
    isLoading: boolean;
    error: string | null;
  };
  bookings: {
    bookings: Booking[];
    isLoading: boolean;
    error: string | null;
  };
  subscriptions: {
    subscriptions: Subscription[];
    isLoading: boolean;
    error: string | null;
  };
  analytics: {
    dashboardStats: DashboardStats | null;
    revenueData: RevenueData[];
    classAnalytics: ClassAnalytics[];
    isLoading: boolean;
    error: string | null;
  };
}
