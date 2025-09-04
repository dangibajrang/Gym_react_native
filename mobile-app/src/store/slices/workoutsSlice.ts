import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Workout, ApiResponse } from '../../types';
import { workoutsService } from '../../services/workoutsService';

interface WorkoutsState {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkoutsState = {
  workouts: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWorkouts = createAsyncThunk(
  'workouts/fetchWorkouts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workoutsService.getWorkouts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workouts');
    }
  }
);

export const logWorkout = createAsyncThunk(
  'workouts/logWorkout',
  async (workoutData: Omit<Workout, '_id' | 'userId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await workoutsService.logWorkout(workoutData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to log workout');
    }
  }
);

export const updateWorkout = createAsyncThunk(
  'workouts/updateWorkout',
  async ({ id, workoutData }: { id: string; workoutData: Partial<Workout> }, { rejectWithValue }) => {
    try {
      const response = await workoutsService.updateWorkout(id, workoutData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update workout');
    }
  }
);

export const deleteWorkout = createAsyncThunk(
  'workouts/deleteWorkout',
  async (workoutId: string, { rejectWithValue }) => {
    try {
      await workoutsService.deleteWorkout(workoutId);
      return workoutId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete workout');
    }
  }
);

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Workouts
      .addCase(fetchWorkouts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workouts = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Log Workout
      .addCase(logWorkout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logWorkout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workouts.unshift(action.payload);
        state.error = null;
      })
      .addCase(logWorkout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Workout
      .addCase(updateWorkout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWorkout.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.workouts.findIndex(workout => workout._id === action.payload._id);
        if (index !== -1) {
          state.workouts[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateWorkout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Workout
      .addCase(deleteWorkout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workouts = state.workouts.filter(workout => workout._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteWorkout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = workoutsSlice.actions;
export default workoutsSlice.reducer;
