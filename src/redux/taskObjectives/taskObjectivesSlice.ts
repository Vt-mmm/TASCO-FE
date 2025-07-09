import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TaskObjective } from "../../common/models/workArea";
import {
  getTaskObjectivesByWorkTaskThunk,
  getTaskObjectiveByIdThunk,
  createTaskObjectiveThunk,
  updateTaskObjectiveThunk,
  deleteTaskObjectiveThunk,
  completeTaskObjectiveThunk,
} from "./taskObjectivesThunks";

export interface TaskObjectivesState {
  // Task objectives grouped by work task ID
  objectivesByWorkTask: Record<string, TaskObjective[]>;

  // Current selected objective for editing
  currentObjective: TaskObjective | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCompleting: boolean;

  // Loading states by work task
  isLoadingByWorkTask: Record<string, boolean>;

  // Error handling
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
}

const initialState: TaskObjectivesState = {
  objectivesByWorkTask: {},
  currentObjective: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isCompleting: false,
  isLoadingByWorkTask: {},
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
};

const taskObjectivesSlice = createSlice({
  name: "taskObjectives",
  initialState,
  reducers: {
    // Clear objectives for a specific work task
    clearObjectivesByWorkTask: (state, action: PayloadAction<string>) => {
      const workTaskId = action.payload;
      delete state.objectivesByWorkTask[workTaskId];
      delete state.isLoadingByWorkTask[workTaskId];
    },

    // Clear current objective
    clearCurrentObjective: (state) => {
      state.currentObjective = null;
    },

    // Clear all errors
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },

    // Set current objective for editing
    setCurrentObjective: (
      state,
      action: PayloadAction<TaskObjective | null>
    ) => {
      state.currentObjective = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get task objectives by work task ID
    builder
      .addCase(getTaskObjectivesByWorkTaskThunk.pending, (state, action) => {
        const workTaskId = action.meta.arg;
        state.isLoadingByWorkTask[workTaskId] = true;
        state.error = null;
      })
      .addCase(getTaskObjectivesByWorkTaskThunk.fulfilled, (state, action) => {
        const { workTaskId, objectives } = action.payload;
        state.objectivesByWorkTask[workTaskId] = objectives;
        state.isLoadingByWorkTask[workTaskId] = false;
        state.error = null;
      })
      .addCase(getTaskObjectivesByWorkTaskThunk.rejected, (state, action) => {
        const workTaskId = action.meta.arg;
        state.isLoadingByWorkTask[workTaskId] = false;
        state.error = action.payload as string;
      });

    // Get task objective by ID
    builder
      .addCase(getTaskObjectiveByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTaskObjectiveByIdThunk.fulfilled, (state, action) => {
        state.currentObjective = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getTaskObjectiveByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create task objective
    builder
      .addCase(createTaskObjectiveThunk.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createTaskObjectiveThunk.fulfilled, (state, action) => {
        const newObjective = action.payload;
        const workTaskId = newObjective.workTaskId;

        // Add to the list for this work task
        if (!state.objectivesByWorkTask[workTaskId]) {
          state.objectivesByWorkTask[workTaskId] = [];
        }
        state.objectivesByWorkTask[workTaskId].push(newObjective);

        // Sort by display order
        state.objectivesByWorkTask[workTaskId].sort(
          (a, b) => a.displayOrder - b.displayOrder
        );

        state.isCreating = false;
        state.createError = null;
      })
      .addCase(createTaskObjectiveThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      });

    // Update task objective
    builder
      .addCase(updateTaskObjectiveThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateTaskObjectiveThunk.fulfilled, (state, action) => {
        const updatedObjective = action.payload;
        const workTaskId = updatedObjective.workTaskId;

        // Update in the list
        if (state.objectivesByWorkTask[workTaskId]) {
          const index = state.objectivesByWorkTask[workTaskId].findIndex(
            (obj) => obj.id === updatedObjective.id
          );
          if (index !== -1) {
            state.objectivesByWorkTask[workTaskId][index] = updatedObjective;
            // Re-sort by display order
            state.objectivesByWorkTask[workTaskId].sort(
              (a, b) => a.displayOrder - b.displayOrder
            );
          }
        }

        // Update current objective if it's the same
        if (state.currentObjective?.id === updatedObjective.id) {
          state.currentObjective = updatedObjective;
        }

        state.isUpdating = false;
        state.updateError = null;
      })
      .addCase(updateTaskObjectiveThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      });

    // Delete task objective
    builder
      .addCase(deleteTaskObjectiveThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteTaskObjectiveThunk.fulfilled, (state, action) => {
        const { workTaskId, objectiveId } = action.payload;

        // Remove from the list
        if (state.objectivesByWorkTask[workTaskId]) {
          state.objectivesByWorkTask[workTaskId] = state.objectivesByWorkTask[
            workTaskId
          ].filter((obj) => obj.id !== objectiveId);
        }

        // Clear current objective if it's the deleted one
        if (state.currentObjective?.id === objectiveId) {
          state.currentObjective = null;
        }

        state.isDeleting = false;
        state.deleteError = null;
      })
      .addCase(deleteTaskObjectiveThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });

    // Complete/uncomplete task objective
    builder
      .addCase(completeTaskObjectiveThunk.pending, (state) => {
        state.isCompleting = true;
        state.error = null;
      })
      .addCase(completeTaskObjectiveThunk.fulfilled, (state, action) => {
        const updatedObjective = action.payload;
        const workTaskId = updatedObjective.workTaskId;

        // Update in the list
        if (state.objectivesByWorkTask[workTaskId]) {
          const index = state.objectivesByWorkTask[workTaskId].findIndex(
            (obj) => obj.id === updatedObjective.id
          );
          if (index !== -1) {
            state.objectivesByWorkTask[workTaskId][index] = updatedObjective;
          }
        }

        // Update current objective if it's the same
        if (state.currentObjective?.id === updatedObjective.id) {
          state.currentObjective = updatedObjective;
        }

        state.isCompleting = false;
        state.error = null;
      })
      .addCase(completeTaskObjectiveThunk.rejected, (state, action) => {
        state.isCompleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearObjectivesByWorkTask,
  clearCurrentObjective,
  clearErrors,
  setCurrentObjective,
} = taskObjectivesSlice.actions;

export default taskObjectivesSlice.reducer;
