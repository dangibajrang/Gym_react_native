import { apiService } from './api';
import { User, ApiResponse, PaginatedResponse } from '../types';

export const usersService = {
  async getUsers(params: { page?: number; limit?: number; role?: string; status?: string; search?: string } = {}): Promise<ApiResponse<User[] | PaginatedResponse<User>>> {
    return apiService.get<User[] | PaginatedResponse<User>>('/api/users', { params });
  },

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiService.get<User>(`/api/users/${userId}`);
  },

  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
    return apiService.post<User>('/api/users', userData);
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<User>(`/api/users/${userId}`, userData);
  },

  async deleteUser(userId: string): Promise<void> {
    await apiService.delete(`/api/users/${userId}`);
  },

  async updateUserStatus(userId: string, status: string): Promise<ApiResponse<User>> {
    return apiService.put<User>(`/api/users/${userId}/status`, { status });
  },

  async resetUserPassword(userId: string): Promise<void> {
    await apiService.post(`/api/users/${userId}/reset-password`);
  },
};
