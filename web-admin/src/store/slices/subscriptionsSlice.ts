import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Subscription, ApiResponse } from '../../types';
import { subscriptionsService } from '../../services/subscriptionsService';

interface SubscriptionsState {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = {
  subscriptions: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async (params: { page?: number; limit?: number; status?: string; plan?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await subscriptionsService.getSubscriptions(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

export const fetchSubscriptionById = createAsyncThunk(
  'subscriptions/fetchSubscriptionById',
  async (subscriptionId: string, { rejectWithValue }) => {
    try {
      const response = await subscriptionsService.getSubscriptionById(subscriptionId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscriptions/updateSubscription',
  async ({ subscriptionId, subscriptionData }: { subscriptionId: string; subscriptionData: Partial<Subscription> }, { rejectWithValue }) => {
    try {
      const response = await subscriptionsService.updateSubscription(subscriptionId, subscriptionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subscription');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscriptions/cancelSubscription',
  async ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }, { rejectWithValue }) => {
    try {
      await subscriptionsService.cancelSubscription(subscriptionId, reason);
      return subscriptionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload.subscriptions || action.payload;
        state.error = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Subscription by ID
      .addCase(fetchSubscriptionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        } else {
          state.subscriptions.push(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchSubscriptionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Subscription
      .addCase(updateSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload);
        if (index !== -1) {
          state.subscriptions[index].status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
