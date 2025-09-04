import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, ApiResponse } from '../../types';
import { socialService } from '../../services/socialService';

interface SocialState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SocialState = {
  posts: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPosts = createAsyncThunk(
  'social/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await socialService.getPosts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'social/createPost',
  async (postData: { content: string; type: string; images?: string[] }, { rejectWithValue }) => {
    try {
      const response = await socialService.createPost(postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'social/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await socialService.likePost(postId);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const addComment = createAsyncThunk(
  'social/addComment',
  async ({ postId, content }: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await socialService.addComment(postId, content);
      return { postId, comment: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Like Post
      .addCase(likePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const post = state.posts.find(p => p._id === action.payload);
        if (post) {
          // Toggle like logic would go here
        }
        state.error = null;
      })
      .addCase(likePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isLoading = false;
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.comments.push(action.payload.comment);
        }
        state.error = null;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = socialSlice.actions;
export default socialSlice.reducer;
