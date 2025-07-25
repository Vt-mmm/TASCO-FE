import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_COMMENTS } from "../../constants/routesApiKeys";
import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../../common/models/comment";
import { 
  BackendApiResponse, 
  PaginatedCommentsResponse 
} from "../../common/models/common";
import { AxiosError } from "axios";

// Helper function cho API calls với retry
async function callApiWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
      const result = await apiCall();
      return result;
    } catch (error) {
      lastError = error;
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        break;
      }
    }
  }
  throw lastError;
}

// Create comment
export const createCommentThunk = createAsyncThunk(
  "comments/create",
  async (commentData: CreateCommentRequest, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(async () => {
        // Axios interceptor returns response.data directly
        const result = await axiosClient.post(
          ROUTES_API_COMMENTS.CREATE,
          commentData
        );
        return result;
      });

      // Response is already unwrapped by axios interceptor  
      const apiResponse = response as unknown;
      
      // Check if it's the wrapped structure: {success: true, message: "...", data: actualCommentData}
      if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse && 'data' in apiResponse) {
        const backendResponse = apiResponse as BackendApiResponse<Comment>;
        
        if (backendResponse.success && backendResponse.data) {
          return backendResponse.data;
        }
        
        // If success is false, throw error with backend message
        throw new Error(backendResponse.message || "Failed to create comment");
      }

      // Check if response is directly the comment data (in case interceptor unwrapped it)
      if (apiResponse && 
          typeof apiResponse === 'object' && 
          'id' in apiResponse && 
          'taskId' in apiResponse && 
          'content' in apiResponse) {
        return apiResponse as Comment;
      }

      // Fallback if response structure is different
      throw new Error("Invalid response structure from server");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;

      if (err.response?.status === 401) {
        return rejectWithValue("Authentication required. Please login again.");
      }

      if (err.response?.status === 403) {
        return rejectWithValue("You don't have permission to create comments.");
      }

      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create comment"
      );
    }
  }
);

// Get comments by task ID with pagination
export const getCommentsByTaskThunk = createAsyncThunk(
  "comments/getByTask",
  async (
    {
      taskId,
      pageIndex = 1,
      pageSize = 10,
    }: {
      taskId: string;
      pageIndex?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const endpoint = ROUTES_API_COMMENTS.GET_BY_TASK(taskId);

      const response = await callApiWithRetry(() =>
        axiosClient.get(endpoint, {
          params: {
            pageIndex,
            pageSize,
          },
        })
      );

      // Response is already unwrapped by axios interceptor
      const apiResponse = response as unknown;
      
      // Check if it's the wrapped structure: {success: true, message: "...", data: ...}
      if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse && 'data' in apiResponse) {
        const backendResponse = apiResponse as BackendApiResponse<PaginatedCommentsResponse | Comment[]>;
        
        if (backendResponse.success && backendResponse.data) {
          const data = backendResponse.data;
          
          // If data is an array of comments directly
          if (Array.isArray(data)) {
            return {
              comments: data,
              totalCount: data.length,
              pageCount: 1,
              currentPage: pageIndex,
              pageSize: pageSize,
            };
          }
          
          // If data is an object with pagination info
          if (typeof data === 'object' && !Array.isArray(data)) {
            const comments = data.comments || data.data || data.items || [];
            return {
              comments: Array.isArray(comments) ? comments : [],
              totalCount: data.totalCount || comments.length,
              pageCount: data.pageCount || 1,
              currentPage: data.currentPage || pageIndex,
              pageSize: data.pageSize || pageSize,
            };
          }
        }
        
        // If success is false, throw error with backend message
        throw new Error(backendResponse.message || "Failed to fetch comments");
      }

      // Fallback for unexpected response structure
      return {
        comments: [],
        totalCount: 0,
        pageCount: 1,
        currentPage: pageIndex,
        pageSize: pageSize,
      };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

// Update comment
export const updateCommentThunk = createAsyncThunk(
  "comments/update",
  async (
    {
      commentId,
      commentData,
    }: { commentId: string; commentData: UpdateCommentRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.put(
          ROUTES_API_COMMENTS.UPDATE(commentId),
          commentData
        )
      );

      // Response is already unwrapped by axios interceptor
      const apiResponse = response as unknown;
      
      // Check if it's the wrapped structure: {success: true, message: "...", data: updatedComment}
      if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse && 'data' in apiResponse) {
        const backendResponse = apiResponse as BackendApiResponse<Comment>;
        
        if (backendResponse.success && backendResponse.data) {
          return backendResponse.data;
        }
        
        // If success is false, throw error with backend message
        throw new Error(backendResponse.message || "Failed to update comment");
      }

      throw new Error("Invalid response structure from server");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update comment"
      );
    }
  }
);

// Delete comment
export const deleteCommentThunk = createAsyncThunk(
  "comments/delete",
  async (commentId: string, { rejectWithValue }) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.delete(ROUTES_API_COMMENTS.DELETE(commentId))
      );
      return commentId;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);
