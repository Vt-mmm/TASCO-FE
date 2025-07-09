import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkArea } from "../../common/models/workArea";
import { toast } from "react-toastify";
import {
  getWorkAreasByProjectThunk,
  getWorkAreaByIdThunk,
  createWorkAreaThunk,
  updateWorkAreaThunk,
  deleteWorkAreaThunk,
} from "./workAreasThunks";

export interface WorkAreasState {
  workAreas: WorkArea[];
  currentWorkArea: WorkArea | null;
  workAreasByProject: Record<string, WorkArea[]>;

  // Loading states
  isLoading: boolean;
  isLoadingByProject: Record<string, boolean>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
}

const initialState: WorkAreasState = {
  workAreas: [],
  currentWorkArea: null,
  workAreasByProject: {},

  // Loading states
  isLoading: false,
  isLoadingByProject: {},
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
};

const workAreasSlice = createSlice({
  name: "workAreas",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearWorkAreas: (state) => {
      state.workAreas = [];
      state.currentWorkArea = null;
    },
    clearWorkAreasByProject: (state, action: PayloadAction<string>) => {
      delete state.workAreasByProject[action.payload];
      delete state.isLoadingByProject[action.payload];
    },
    setCurrentWorkArea: (state, action: PayloadAction<WorkArea | null>) => {
      state.currentWorkArea = action.payload;
    },
    moveTaskBetweenWorkAreas: (
      state,
      action: PayloadAction<{
        projectId: string;
        taskId: string;
        fromWorkAreaId: string;
        toWorkAreaId: string;
      }>
    ) => {
      const { projectId, taskId, fromWorkAreaId, toWorkAreaId } = action.payload;
      const projectWorkAreas = state.workAreasByProject[projectId];
      
      if (!projectWorkAreas) return;

      // Find the task in the source work area
      const fromWorkArea = projectWorkAreas.find(wa => wa.id === fromWorkAreaId);
      const toWorkArea = projectWorkAreas.find(wa => wa.id === toWorkAreaId);

      if (!fromWorkArea || !toWorkArea || !fromWorkArea.workTasks) return;

      const taskIndex = fromWorkArea.workTasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return;

      // Remove task from source work area
      const task = fromWorkArea.workTasks.splice(taskIndex, 1)[0];
      
      // Add task to destination work area
      if (!toWorkArea.workTasks) {
        toWorkArea.workTasks = [];
      }
      toWorkArea.workTasks.push(task);

      // Also update the general workAreas array
      const generalFromWorkArea = state.workAreas.find(wa => wa.id === fromWorkAreaId);
      const generalToWorkArea = state.workAreas.find(wa => wa.id === toWorkAreaId);
      
      if (generalFromWorkArea && generalToWorkArea && generalFromWorkArea.workTasks) {
        const generalTaskIndex = generalFromWorkArea.workTasks.findIndex(task => task.id === taskId);
        if (generalTaskIndex !== -1) {
          const generalTask = generalFromWorkArea.workTasks.splice(generalTaskIndex, 1)[0];
          if (!generalToWorkArea.workTasks) {
            generalToWorkArea.workTasks = [];
          }
          generalToWorkArea.workTasks.push(generalTask);
        }
      }
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    // Get WorkAreas by Project
    builder
      .addCase(getWorkAreasByProjectThunk.pending, (state, action) => {
        state.isLoadingByProject[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(getWorkAreasByProjectThunk.fulfilled, (state, action) => {
        const { projectId, workAreas } = action.payload;
        state.isLoadingByProject[projectId] = false;
        state.workAreasByProject[projectId] = workAreas as WorkArea[];
        state.workAreas = workAreas as WorkArea[];
      })
      .addCase(getWorkAreasByProjectThunk.rejected, (state, action) => {
        const projectId = action.meta.arg;
        state.isLoadingByProject[projectId] = false;
        state.error = action.payload as string;
        // toast.error(state.error); // Temporarily disabled to prevent re-render loops
      });

    // Get WorkArea by ID
    builder
      .addCase(getWorkAreaByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkAreaByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkArea = action.payload;
      })
      .addCase(getWorkAreaByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // toast.error(state.error); // Temporarily disabled to prevent re-render loops
      });

    // Create WorkArea
    builder
      .addCase(createWorkAreaThunk.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createWorkAreaThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        const newWorkArea = action.payload;

        // Add to general workAreas array
        state.workAreas.push(newWorkArea);

        // Add to project-specific workAreas
        if (
          newWorkArea.projectId &&
          state.workAreasByProject[newWorkArea.projectId]
        ) {
          state.workAreasByProject[newWorkArea.projectId].push(newWorkArea);
        }

        toast.success("Work area created successfully!");
      })
      .addCase(createWorkAreaThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
        toast.error(state.createError);
      });

    // Update WorkArea
    builder
      .addCase(updateWorkAreaThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateWorkAreaThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedWorkArea = action.payload;

        // Update in general workAreas array
        const index = state.workAreas.findIndex(
          (wa) => wa.id === updatedWorkArea.id
        );
        if (index !== -1) {
          state.workAreas[index] = updatedWorkArea;
        }

        // Update in project-specific workAreas
        if (
          updatedWorkArea.projectId &&
          state.workAreasByProject[updatedWorkArea.projectId]
        ) {
          const projectIndex = state.workAreasByProject[
            updatedWorkArea.projectId
          ].findIndex((wa) => wa.id === updatedWorkArea.id);
          if (projectIndex !== -1) {
            state.workAreasByProject[updatedWorkArea.projectId][projectIndex] =
              updatedWorkArea;
          }
        }

        // Update currentWorkArea if it's the same
        if (state.currentWorkArea?.id === updatedWorkArea.id) {
          state.currentWorkArea = updatedWorkArea;
        }

        toast.success("Work area updated successfully!");
      })
      .addCase(updateWorkAreaThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
        toast.error(state.updateError);
      });

    // Delete WorkArea
    builder
      .addCase(deleteWorkAreaThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteWorkAreaThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedWorkAreaId = action.payload;

        // Remove from general workAreas array
        state.workAreas = state.workAreas.filter(
          (wa) => wa.id !== deletedWorkAreaId
        );

        // Remove from project-specific workAreas
        Object.keys(state.workAreasByProject).forEach((projectId) => {
          state.workAreasByProject[projectId] = state.workAreasByProject[
            projectId
          ].filter((wa) => wa.id !== deletedWorkAreaId);
        });

        // Clear currentWorkArea if it was deleted
        if (state.currentWorkArea?.id === deletedWorkAreaId) {
          state.currentWorkArea = null;
        }

        toast.success("Work area deleted successfully!");
      })
      .addCase(deleteWorkAreaThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
        toast.error(state.deleteError);
      });
  },
});

export const {
  clearError,
  clearWorkAreas,
  clearWorkAreasByProject,
  setCurrentWorkArea,
  moveTaskBetweenWorkAreas,
  reset,
} = workAreasSlice.actions;

export default workAreasSlice.reducer;
