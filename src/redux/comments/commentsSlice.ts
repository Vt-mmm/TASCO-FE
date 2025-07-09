import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment } from "../../common/models/comment";
import { toast } from "react-toastify";
import {
  createCommentThunk,
  getCommentsByTaskThunk,
  updateCommentThunk,
  deleteCommentThunk,
} from "./commentsThunks";

export interface CommentsState {
  comments: Comment[];
  currentTaskComments: Comment[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  successMessage: string | null;
  // Pagination metadata
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

const initialState: CommentsState = {
  comments: [],
  currentTaskComments: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  successMessage: null,
  // Pagination metadata
  totalCount: 0,
  pageCount: 0,
  currentPage: 1,
  pageSize: 10,
};

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    setCurrentTaskComments: (state, action: PayloadAction<Comment[]>) => {
      state.currentTaskComments = action.payload;
    },
    clearCurrentTaskComments: (state) => {
      state.currentTaskComments = [];
      state.totalCount = 0;
      state.pageCount = 0;
      state.currentPage = 1;
    },
    resetToFirstPage: (state) => {
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create comment
      .addCase(createCommentThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCommentThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.comments.push(action.payload);
        state.currentTaskComments.push(action.payload);
        state.successMessage = "Comment created successfully";
        state.currentPage = 1; // Reset to first page on successful creation

        toast.success(state.successMessage);
      })
      .addCase(createCommentThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Get comments by task
      .addCase(getCommentsByTaskThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCommentsByTaskThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTaskComments = action.payload.comments;
        // Update pagination metadata
        state.totalCount = action.payload.totalCount;
        state.pageCount = action.payload.pageCount;
        state.currentPage = action.payload.currentPage;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getCommentsByTaskThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Update comment
      .addCase(updateCommentThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCommentThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedComment = action.payload;

        // Update in comments array
        const commentIndex = state.comments.findIndex(
          (c) => c.id === updatedComment.id
        );
        if (commentIndex !== -1) {
          state.comments[commentIndex] = updatedComment;
        }

        // Update in current task comments
        const taskCommentIndex = state.currentTaskComments.findIndex(
          (c) => c.id === updatedComment.id
        );
        if (taskCommentIndex !== -1) {
          state.currentTaskComments[taskCommentIndex] = updatedComment;
        }

        state.successMessage = "Comment updated successfully";
        toast.success(state.successMessage);
      })
      .addCase(updateCommentThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Delete comment
      .addCase(deleteCommentThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const commentId = action.payload;

        // Remove from comments array
        state.comments = state.comments.filter((c) => c.id !== commentId);

        // Remove from current task comments
        state.currentTaskComments = state.currentTaskComments.filter(
          (c) => c.id !== commentId
        );

        state.successMessage = "Comment deleted successfully";
        toast.success(state.successMessage);
      })
      .addCase(deleteCommentThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
        toast.error(state.error);
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentTaskComments,
  clearCurrentTaskComments,
  resetToFirstPage,
} = commentsSlice.actions;
export default commentsSlice.reducer;
