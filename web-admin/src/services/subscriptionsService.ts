import { apiService } from './api';
import { Subscription, ApiResponse, PaginatedResponse } from '../types';

export const subscriptionsService = {
  async getSubscriptions(params: { page?: number; limit?: number; status?: string; plan?: string } = {}): Promise<ApiResponse<Subscription[] | PaginatedResponse<Subscription>>> {
    return apiService.get<Subscription[] | PaginatedResponse<Subscription>>('/api/subscriptions', { params });
  },

  async getSubscriptionById(subscriptionId: string): Promise<ApiResponse<Subscription>> {
    return apiService.get<Subscription>(`/api/subscriptions/${subscriptionId}`);
  },

  async updateSubscription(subscriptionId: string, subscriptionData: Partial<Subscription>): Promise<ApiResponse<Subscription>> {
    return apiService.put<Subscription>(`/api/subscriptions/${subscriptionId}`, subscriptionData);
  },

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    await apiService.put(`/api/subscriptions/${subscriptionId}/cancel`, { reason });
  },

  async getSubscriptionStats(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<any>> {
    return apiService.get<any>('/api/subscriptions/stats', { params });
  },

  async getExpiringSubscriptions(params: { days?: number } = {}): Promise<ApiResponse<Subscription[]>> {
    return apiService.get<Subscription[]>('/api/subscriptions/expiring', { params });
  },
};
