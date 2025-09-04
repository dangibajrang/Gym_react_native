import { apiService } from './api';
import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiService.post<ApiResponse<{ user: User; token: string }>>('/api/auth/login', credentials);
    
    if (response.success && response.data?.token) {
      await SecureStore.setItemAsync('authToken', response.data.token);
    }
    
    return response;
  },

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiService.post<ApiResponse<{ user: User; token: string }>>('/api/auth/register', userData);
    
    if (response.success && response.data?.token) {
      await SecureStore.setItemAsync('authToken', response.data.token);
    }
    
    return response;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get<ApiResponse<User>>('/api/auth/profile');
  },

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<ApiResponse<User>>('/api/auth/profile', userData);
  },

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiService.put('/api/auth/change-password', passwordData);
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
  },

  async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  },
};
