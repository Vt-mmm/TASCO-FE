import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkTask } from "../../common/models/workArea";
import { toast } from "react-toastify";
import {
  getWorkTasksByWorkAreaThunk,
  getWorkTaskByIdThunk,
  createWorkTaskThunk,
  updateWorkTaskThunk,
  deleteWorkTaskThunk,
} from "./workTasksThunks";         

export interface WorkTasksState {
  workTasks: WorkTask[];
  currentWorkTask: WorkTask | null;
  workTasksByWorkArea: Record<string, WorkTask[]>;

  // Loading states
  isLoading: boolean;
  isLoadingByWorkArea: Record<string, boolean>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
}

const initialState: WorkTasksState = {
  workTasks: [],
  currentWorkTask: null,
  workTasksByWorkArea: {},

  // Loading states
  isLoading: false,
  isLoadingByWorkArea: {},
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
};

const workTasksSlice = createSlice({
  name: "workTasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearWorkTasks: (state) => {
      state.workTasks = [];
      state.currentWorkTask = null;
    },
    clearWorkTasksByWorkArea: (state, action: PayloadAction<string>) => {
      delete state.workTasksByWorkArea[action.payload];
      delete state.isLoadingByWorkArea[action.payload];
    },
    setCurrentWorkTask: (state, action: PayloadAction<WorkTask | null>) => {
      state.currentWorkTask = action.payload;
    },
    addWorkTaskToWorkArea: (
      state,
      action: PayloadAction<{ workAreaId: string; workTask: WorkTask }>
    ) => {
      const { workAreaId, workTask } = action.payload;
      if (!state.workTasksByWorkArea[workAreaId]) {
        state.workTasksByWorkArea[workAreaId] = [];
      }
      state.workTasksByWorkArea[workAreaId].push(workTask);
      state.workTasks.push(workTask);
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    // Get WorkTasks by WorkArea
    builder
      .addCase(getWorkTasksByWorkAreaThunk.pending, (state, action) => {
        state.isLoadingByWorkArea[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(getWorkTasksByWorkAreaThunk.fulfilled, (state, action) => {
        const { workAreaId, workTasks } = action.payload;
        state.isLoadingByWorkArea[workAreaId] = false;
        state.workTasksByWorkArea[workAreaId] = workTasks as WorkTask[];
        // Also update general workTasks array
        state.workTasks = workTasks as WorkTask[];
      })
      .addCase(getWorkTasksByWorkAreaThunk.rejected, (state, action) => {
        const workAreaId = action.meta.arg;
        state.isLoadingByWorkArea[workAreaId] = false;
        state.error = action.payload as string;
        toast.error(state.error);
      });

    // Get WorkTask by ID
    builder
      .addCase(getWorkTaskByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkTaskByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkTask = action.payload;
      })
      .addCase(getWorkTaskByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      });

    // Create WorkTask
    builder
      .addCase(createWorkTaskThunk.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createWorkTaskThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        const newWorkTask = action.payload;

        // Add to general workTasks array
        state.workTasks.push(newWorkTask);

        // Add to workArea-specific workTasks
        if (
          newWorkTask.workAreaId &&
          state.workTasksByWorkArea[newWorkTask.workAreaId]
        ) {
          state.workTasksByWorkArea[newWorkTask.workAreaId].push(newWorkTask);
        }

        toast.success("Work task created successfully!");
      })
      .addCase(createWorkTaskThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
        toast.error(state.createError);
      });

    // Update WorkTask
    builder
      .addCase(updateWorkTaskThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateWorkTaskThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedWorkTask = action.payload;

        // Update in general workTasks array
        const index = state.workTasks.findIndex(
          (wt) => wt.id === updatedWorkTask.id
        );
        if (index !== -1) {
          state.workTasks[index] = updatedWorkTask;
        }

        // Update in workArea-specific workTasks
        if (
          updatedWorkTask.workAreaId &&
          state.workTasksByWorkArea[updatedWorkTask.workAreaId]
        ) {
          const workAreaIndex = state.workTasksByWorkArea[
            updatedWorkTask.workAreaId
          ].findIndex((wt) => wt.id === updatedWorkTask.id);
          if (workAreaIndex !== -1) {
            state.workTasksByWorkArea[updatedWorkTask.workAreaId][
              workAreaIndex
            ] = updatedWorkTask;
          }
        }

        // Update currentWorkTask if it's the same
        if (state.currentWorkTask?.id === updatedWorkTask.id) {
          state.currentWorkTask = updatedWorkTask;
        }

        toast.success("Work task updated successfully!");
      })
      .addCase(updateWorkTaskThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
        toast.error(state.updateError);
      });

    // Delete WorkTask
    builder
      .addCase(deleteWorkTaskThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteWorkTaskThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedWorkTaskId = action.payload;

        // Remove from general workTasks array
        state.workTasks = state.workTasks.filter(
          (wt) => wt.id !== deletedWorkTaskId
        );

        // Remove from workArea-specific workTasks
        Object.keys(state.workTasksByWorkArea).forEach((workAreaId) => {
          state.workTasksByWorkArea[workAreaId] = state.workTasksByWorkArea[
            workAreaId
          ].filter((wt) => wt.id !== deletedWorkTaskId);
        });

        // Clear currentWorkTask if it's the deleted one
        if (state.currentWorkTask?.id === deletedWorkTaskId) {
          state.currentWorkTask = null;
        }

        toast.success("Work task deleted successfully!");
      })
      .addCase(deleteWorkTaskThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
        toast.error(state.deleteError);
      });
  },
});

export const {
  clearError,
  clearWorkTasks,
  clearWorkTasksByWorkArea,
  setCurrentWorkTask,
  addWorkTaskToWorkArea,
  reset,
} = workTasksSlice.actions;

export default workTasksSlice.reducer;
