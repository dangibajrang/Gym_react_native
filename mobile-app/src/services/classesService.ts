import { apiService } from './api';
import { Class, Booking, ApiResponse } from '../types';

export const classesService = {
  async getClasses(): Promise<ApiResponse<Class[]>> {
    return apiService.get<ApiResponse<Class[]>>('/api/classes');
  },

  async getClassById(classId: string): Promise<ApiResponse<Class>> {
    return apiService.get<ApiResponse<Class>>(`/api/classes/${classId}`);
  },

  async getMyBookings(): Promise<ApiResponse<Booking[]>> {
    return apiService.get<ApiResponse<Booking[]>>('/api/bookings');
  },

  async bookClass(bookingData: { classId: string; classInstanceId: string }): Promise<ApiResponse<Booking>> {
    return apiService.post<ApiResponse<Booking>>('/api/bookings', bookingData);
  },

  async cancelBooking(bookingId: string): Promise<void> {
    await apiService.put(`/api/bookings/${bookingId}/cancel`);
  },

  async getAvailableDates(experienceId: string): Promise<ApiResponse<string[]>> {
    return apiService.get<ApiResponse<string[]>>(`/api/bookings/available-dates/${experienceId}`);
  },
};
