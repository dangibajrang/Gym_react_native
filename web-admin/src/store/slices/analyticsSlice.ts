import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardStats, RevenueData, ClassAnalytics, ApiResponse } from '../../types';
import { analyticsService } from '../../services/analyticsService';

interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  revenueData: RevenueData[];
  classAnalytics: ClassAnalytics[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboardStats: null,
  revenueData: [],
  classAnalytics: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'analytics/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getDashboardStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchRevenueData = createAsyncThunk(
  'analytics/fetchRevenueData',
  async (params: { startDate?: string; endDate?: string; period?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getRevenueData(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue data');
    }
  }
);

export const fetchClassAnalytics = createAsyncThunk(
  'analytics/fetchClassAnalytics',
  async (params: { startDate?: string; endDate?: string; classId?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getClassAnalytics(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch class analytics');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Revenue Data
      .addCase(fetchRevenueData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueData = action.payload;
        state.error = null;
      })
      .addCase(fetchRevenueData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Class Analytics
      .addCase(fetchClassAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClassAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.classAnalytics = action.payload;
        state.error = null;
      })
      .addCase(fetchClassAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
