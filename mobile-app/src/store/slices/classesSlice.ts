import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Class, Booking, ApiResponse } from '../../types';
import { classesService } from '../../services/classesService';

interface ClassesState {
  classes: Class[];
  myBookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ClassesState = {
  classes: [],
  myBookings: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await classesService.getClasses();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch classes');
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'classes/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await classesService.getMyBookings();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const bookClass = createAsyncThunk(
  'classes/bookClass',
  async (bookingData: { classId: string; classInstanceId: string }, { rejectWithValue }) => {
    try {
      const response = await classesService.bookClass(bookingData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book class');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'classes/cancelBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      await classesService.cancelBooking(bookingId);
      return bookingId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Classes
      .addCase(fetchClasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.classes = action.payload;
        state.error = null;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch My Bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBookings = action.payload;
        state.error = null;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Book Class
      .addCase(bookClass.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bookClass.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBookings.push(action.payload);
        state.error = null;
      })
      .addCase(bookClass.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBookings = state.myBookings.filter(booking => booking._id !== action.payload);
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = classesSlice.actions;
export default classesSlice.reducer;
