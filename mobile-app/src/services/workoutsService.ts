import { apiService } from './api';
import { Workout, ApiResponse } from '../types';

export const workoutsService = {
  async getWorkouts(): Promise<ApiResponse<Workout[]>> {
    return apiService.get<ApiResponse<Workout[]>>('/api/workouts');
  },

  async getWorkoutById(workoutId: string): Promise<ApiResponse<Workout>> {
    return apiService.get<ApiResponse<Workout>>(`/api/workouts/${workoutId}`);
  },

  async logWorkout(workoutData: Omit<Workout, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Workout>> {
    return apiService.post<ApiResponse<Workout>>('/api/workouts', workoutData);
  },

  async updateWorkout(workoutId: string, workoutData: Partial<Workout>): Promise<ApiResponse<Workout>> {
    return apiService.put<ApiResponse<Workout>>(`/api/workouts/${workoutId}`, workoutData);
  },

  async deleteWorkout(workoutId: string): Promise<void> {
    await apiService.delete(`/api/workouts/${workoutId}`);
  },

  async getProgressData(): Promise<ApiResponse<any>> {
    return apiService.get<ApiResponse<any>>('/api/workouts/progress');
  },
};
