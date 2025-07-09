import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_COMMENTS } from "../../constants/routesApiKeys";
import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../../common/models/comment";
import { ApiResponse } from "../../common/models/common";
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
        const result = await axiosClient.post<ApiResponse<Comment>>(
          ROUTES_API_COMMENTS.CREATE,
          commentData
        );
        return result;
      });

      // Backend returns: {success: true, message: "...", data: actualCommentData}
      // Handle different response structures
      let responseCommentData = response.data.data;

      // If response is wrapped in success/message format
      if (response.data.success && response.data.data) {
        responseCommentData = response.data.data;
      }
      // If data is directly in response.data (fallback)
      else if (
        !responseCommentData &&
        response.data &&
        !response.data.success
      ) {
        responseCommentData = response.data;
      }

      // For create comment, we expect a single comment object
      // Backend might return just the comment ID and we need to construct the comment
      if (
        !responseCommentData ||
        (!responseCommentData.id && typeof responseCommentData === "string")
      ) {
        // Return a minimal object to indicate success, UI will refresh to get full data
        return {
          id: responseCommentData || "temp-id",
          taskId: commentData.taskId,
          content: commentData.content,
          createdAt: new Date().toISOString(),
        };
      }

      return responseCommentData;
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
        axiosClient.get<ApiResponse<Comment[]>>(endpoint, {
          params: {
            pageIndex,
            pageSize,
          },
        })
      );

      // Handle different response structures
      let commentsData = response.data.data;

      // If response is wrapped in success/message format with comments array
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.comments
      ) {
        commentsData = response.data.data.comments;
      }
      // If response data has comments property directly
      else if (commentsData && commentsData.comments) {
        commentsData = commentsData.comments;
      }
      // If data is directly in response.data and has comments property
      else if (response.data && response.data.comments) {
        commentsData = response.data.comments;
      }
      // If data is directly in response.data (fallback)
      else if (!commentsData && response.data && !response.data.success) {
        commentsData = response.data;
      }

      // Ensure we return an array and include pagination metadata
      const comments = Array.isArray(commentsData) ? commentsData : [];

      // Extract pagination metadata
      const paginationData = response.data.data || response.data;
      const result = {
        comments,
        totalCount: paginationData?.totalCount || comments.length,
        pageCount: paginationData?.pageCount || 1,
        currentPage: paginationData?.currentPage || pageIndex,
        pageSize: pageSize,
      };

      return result;
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
        axiosClient.put<ApiResponse<Comment>>(
          ROUTES_API_COMMENTS.UPDATE(commentId),
          commentData
        )
      );

      // Handle backend response format
      let updatedComment = response.data.data;
      if (!updatedComment && response.data.success && response.data.data) {
        updatedComment = response.data.data;
      }
      if (!updatedComment && response.data && !response.data.success) {
        updatedComment = response.data;
      }

      return updatedComment;
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
