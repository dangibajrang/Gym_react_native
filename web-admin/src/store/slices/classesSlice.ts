import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Class, ApiResponse } from '../../types';
import { classesService } from '../../services/classesService';

interface ClassesState {
  classes: Class[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ClassesState = {
  classes: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (params: { page?: number; limit?: number; type?: string; status?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await classesService.getClasses(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch classes');
    }
  }
);

export const fetchClassById = createAsyncThunk(
  'classes/fetchClassById',
  async (classId: string, { rejectWithValue }) => {
    try {
      const response = await classesService.getClassById(classId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch class');
    }
  }
);

export const createClass = createAsyncThunk(
  'classes/createClass',
  async (classData: Omit<Class, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await classesService.createClass(classData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create class');
    }
  }
);

export const updateClass = createAsyncThunk(
  'classes/updateClass',
  async ({ classId, classData }: { classId: string; classData: Partial<Class> }, { rejectWithValue }) => {
    try {
      const response = await classesService.updateClass(classId, classData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update class');
    }
  }
);

export const deleteClass = createAsyncThunk(
  'classes/deleteClass',
  async (classId: string, { rejectWithValue }) => {
    try {
      await classesService.deleteClass(classId);
      return classId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete class');
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
        state.classes = action.payload.classes || action.payload;
        state.error = null;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Class by ID
      .addCase(fetchClassById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.classes.findIndex(cls => cls._id === action.payload._id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        } else {
          state.classes.push(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchClassById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Class
      .addCase(createClass.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.isLoading = false;
        state.classes.push(action.payload);
        state.error = null;
      })
      .addCase(createClass.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Class
      .addCase(updateClass.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.classes.findIndex(cls => cls._id === action.payload._id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateClass.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Class
      .addCase(deleteClass.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.isLoading = false;
        state.classes = state.classes.filter(cls => cls._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteClass.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = classesSlice.actions;
export default classesSlice.reducer;
