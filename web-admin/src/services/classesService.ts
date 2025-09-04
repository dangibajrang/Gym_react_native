import { apiService } from './api';
import { Class, ApiResponse, PaginatedResponse } from '../types';

export const classesService = {
  async getClasses(params: { page?: number; limit?: number; type?: string; status?: string; search?: string } = {}): Promise<ApiResponse<Class[] | PaginatedResponse<Class>>> {
    return apiService.get<Class[] | PaginatedResponse<Class>>('/api/classes', { params });
  },

  async getClassById(classId: string): Promise<ApiResponse<Class>> {
    return apiService.get<Class>(`/api/classes/${classId}`);
  },

  async createClass(classData: Omit<Class, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Class>> {
    return apiService.post<Class>('/api/classes', classData);
  },

  async updateClass(classId: string, classData: Partial<Class>): Promise<ApiResponse<Class>> {
    return apiService.put<Class>(`/api/classes/${classId}`, classData);
  },

  async deleteClass(classId: string): Promise<void> {
    await apiService.delete(`/api/classes/${classId}`);
  },

  async updateClassStatus(classId: string, status: string): Promise<ApiResponse<Class>> {
    return apiService.put<Class>(`/api/classes/${classId}/status`, { status });
  },

  async getClassBookings(classId: string, params: { page?: number; limit?: number; date?: string } = {}): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(`/api/classes/${classId}/bookings`, { params });
  },
};
