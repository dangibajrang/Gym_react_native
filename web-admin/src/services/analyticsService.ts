import { apiService } from './api';
import { DashboardStats, RevenueData, ClassAnalytics, ApiResponse } from '../types';

export const analyticsService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiService.get<DashboardStats>('/api/analytics/dashboard');
  },

  async getRevenueData(params: { startDate?: string; endDate?: string; period?: string } = {}): Promise<ApiResponse<RevenueData[]>> {
    return apiService.get<RevenueData[]>('/api/analytics/revenue', { params });
  },

  async getClassAnalytics(params: { startDate?: string; endDate?: string; classId?: string } = {}): Promise<ApiResponse<ClassAnalytics[]>> {
    return apiService.get<ClassAnalytics[]>('/api/analytics/classes', { params });
  },

  async getMemberAnalytics(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<any>> {
    return apiService.get<any>('/api/analytics/members', { params });
  },

  async getAttendanceAnalytics(params: { startDate?: string; endDate?: string; classId?: string } = {}): Promise<ApiResponse<any>> {
    return apiService.get<any>('/api/analytics/attendance', { params });
  },
};
