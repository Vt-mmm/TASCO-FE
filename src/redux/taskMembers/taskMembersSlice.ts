import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  TaskMember,
  TaskMemberListResponse,
} from "../../common/models/taskMember";
// Import task member thunks
import {
  getTaskMembersByTaskIdThunk,
  createTaskMemberThunk,
  updateTaskMemberThunk,
  deleteTaskMemberThunk,
  removeTaskMemberThunk,
  getTaskMemberByIdThunk,
} from "./taskMembersThunks";

export interface TaskMembersState {
  members: TaskMember[];
  currentMember: TaskMember | null;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
}

const initialState: TaskMembersState = {
  members: [],
  currentMember: null,
  totalCount: 0,
  pageIndex: 1,
  pageSize: 10,
  hasNextPage: false,
  hasPreviousPage: false,

  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
};

const taskMembersSlice = createSlice({
  name: "taskMembers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearCurrentMember: (state) => {
      state.currentMember = null;
    },
    setCurrentMember: (state, action: PayloadAction<TaskMember>) => {
      state.currentMember = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get task members by task ID
    builder
      .addCase(getTaskMembersByTaskIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTaskMembersByTaskIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = action.payload as TaskMemberListResponse;

        // Validate response structure
        if (!response) {
          state.members = [];
          state.totalCount = 0;
          return;
        }

        if (!Array.isArray(response.members)) {
          state.members = [];
        } else {
          state.members = response.members;
        }

        state.totalCount = response.totalCount || 0;
        state.pageIndex = response.pageIndex || 1;
        state.pageSize = response.pageSize || 10;
        state.hasNextPage = response.hasNextPage || false;
        state.hasPreviousPage = response.hasPreviousPage || false;
      })
      .addCase(getTaskMembersByTaskIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.members = [];
      });

    // Get task member by ID
    builder
      .addCase(getTaskMemberByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTaskMemberByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMember = action.payload;
      })
      .addCase(getTaskMemberByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentMember = null;
      });

    // Create task member
    builder
      .addCase(createTaskMemberThunk.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createTaskMemberThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        const newMember = action.payload;
        state.members.push(newMember);
        state.totalCount += 1;
      })
      .addCase(createTaskMemberThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      });

    // Update task member
    builder
      .addCase(updateTaskMemberThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateTaskMemberThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedMember = action.payload;
        const index = state.members.findIndex(
          (member) => member.id === updatedMember.id
        );
        if (index !== -1) {
          state.members[index] = updatedMember;
        }
        if (state.currentMember?.id === updatedMember.id) {
          state.currentMember = updatedMember;
        }
      })
      .addCase(updateTaskMemberThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      });

    // Delete task member (hard delete)
    builder
      .addCase(deleteTaskMemberThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteTaskMemberThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const { memberId } = action.payload;
        state.members = state.members.filter(
          (member) => member.id !== memberId
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.currentMember?.id === memberId) {
          state.currentMember = null;
        }
      })
      .addCase(deleteTaskMemberThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });

    // Remove task member (soft delete)
    builder
      .addCase(removeTaskMemberThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(removeTaskMemberThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const { memberId } = action.payload;
        const index = state.members.findIndex(
          (member) => member.id === memberId
        );
        if (index !== -1) {
          state.members[index] = {
            ...state.members[index],
            isRemoved: true,
            removedAt: new Date().toISOString(),
          };
        }
        if (state.currentMember?.id === memberId) {
          state.currentMember = {
            ...state.currentMember,
            isRemoved: true,
            removedAt: new Date().toISOString(),
          } as TaskMember;
        }
      })
      .addCase(removeTaskMemberThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentMember, setCurrentMember } =
  taskMembersSlice.actions;

export default taskMembersSlice.reducer;
