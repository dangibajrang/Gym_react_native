import { apiService } from './api';
import { Booking, ApiResponse, PaginatedResponse } from '../types';

export const bookingsService = {
  async getBookings(params: { page?: number; limit?: number; status?: string; userId?: string; classId?: string } = {}): Promise<ApiResponse<Booking[] | PaginatedResponse<Booking>>> {
    return apiService.get<Booking[] | PaginatedResponse<Booking>>('/api/bookings', { params });
  },

  async getBookingById(bookingId: string): Promise<ApiResponse<Booking>> {
    return apiService.get<Booking>(`/api/bookings/${bookingId}`);
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`/api/bookings/${bookingId}/status`, { status });
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    await apiService.put(`/api/bookings/${bookingId}/cancel`, { reason });
  },

  async getBookingStats(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<any>> {
    return apiService.get<any>('/api/bookings/stats', { params });
  },

  async getUpcomingBookings(params: { limit?: number } = {}): Promise<ApiResponse<Booking[]>> {
    return apiService.get<Booking[]>('/api/bookings/upcoming', { params });
  },
};
