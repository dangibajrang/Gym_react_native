import { apiService } from './api';
import { Subscription, ApiResponse } from '../types';

export const subscriptionService = {
  async getPlans(): Promise<ApiResponse<Subscription[]>> {
    return apiService.get<ApiResponse<Subscription[]>>('/api/subscriptions/plans');
  },

  async getCurrentSubscription(): Promise<ApiResponse<Subscription | null>> {
    return apiService.get<ApiResponse<Subscription | null>>('/api/subscriptions/current');
  },

  async subscribeToPlan(subscriptionData: { planId: string; paymentMethodId: string }): Promise<ApiResponse<Subscription>> {
    return apiService.post<ApiResponse<Subscription>>('/api/subscriptions/subscribe', subscriptionData);
  },

  async cancelSubscription(reason?: string): Promise<void> {
    await apiService.put('/api/subscriptions/cancel', { reason });
  },

  async updatePaymentMethod(paymentMethodId: string): Promise<void> {
    await apiService.put('/api/subscriptions/payment-method', { paymentMethodId });
  },
};
