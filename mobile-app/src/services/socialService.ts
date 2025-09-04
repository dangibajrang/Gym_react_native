import { apiService } from './api';
import { Post, Comment, ApiResponse } from '../types';

export const socialService = {
  async getPosts(): Promise<ApiResponse<Post[]>> {
    return apiService.get<ApiResponse<Post[]>>('/api/posts');
  },

  async getPostById(postId: string): Promise<ApiResponse<Post>> {
    return apiService.get<ApiResponse<Post>>(`/api/posts/${postId}`);
  },

  async createPost(postData: { content: string; type: string; images?: string[] }): Promise<ApiResponse<Post>> {
    return apiService.post<ApiResponse<Post>>('/api/posts', postData);
  },

  async likePost(postId: string): Promise<void> {
    await apiService.post(`/api/posts/${postId}/like`);
  },

  async addComment(postId: string, content: string): Promise<ApiResponse<Comment>> {
    return apiService.post<ApiResponse<Comment>>(`/api/posts/${postId}/comments`, { content });
  },

  async deletePost(postId: string): Promise<void> {
    await apiService.delete(`/api/posts/${postId}`);
  },
};
