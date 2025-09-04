import { apiService } from './api';
import { User, LoginCredentials, ApiResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiService.post<{ user: User; token: string }>('/api/auth/login', credentials);
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get<User>('/api/auth/profile');
  },

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<User>('/api/auth/profile', userData);
  },

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiService.put('/api/auth/change-password', passwordData);
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
  },
};
