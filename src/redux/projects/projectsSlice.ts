import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "../../common/models/project";
import { toast } from "react-toastify";
import {
  getExploreProjectsThunk,
  getMyProjectsThunk,
  getProjectByIdThunk,
  createProjectThunk,
  updateProjectThunk,
  deleteProjectThunk,
  approveJoinRequestThunk,
  rejectJoinRequestThunk,
  joinProjectThunk,
  removeMemberThunk,
} from "./projectsThunks";

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isManagingRequests: boolean;
  isJoining: boolean;
  isRemovingMember: boolean;
  error: string | null;
  successMessage: string | null;
  // Pagination fields
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isManagingRequests: false,
  isJoining: false,
  isRemovingMember: false,
  error: null,
  successMessage: null,
  // Initialize pagination
  totalCount: 0,
  pageCount: 0,
  currentPage: 1,
  pageSize: 10,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when page size changes
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.totalCount = 0;
      state.pageCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get explore projects (for ExploreProjectsPage)
      .addCase(getExploreProjectsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getExploreProjectsThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        // Handle pagination response
        if (action.payload && typeof action.payload === "object") {
          const payload = action.payload as {
            projects?: Project[];
            totalCount?: number;
            pageCount?: number;
            currentPage?: number;
          };

          // Check if payload has pagination structure
          if (Array.isArray(payload.projects)) {
            state.projects = payload.projects;
            state.totalCount = payload.totalCount || payload.projects.length;
            state.pageCount =
              payload.pageCount || Math.ceil(state.totalCount / state.pageSize);

            // Only update currentPage if it's provided in the response
            if (payload.currentPage) {
              state.currentPage = payload.currentPage;
            }
          }
          // Fallback: if payload is directly an array
          else if (Array.isArray(action.payload)) {
            state.projects = action.payload as Project[];
            state.totalCount = action.payload.length;
            state.pageCount = Math.ceil(state.totalCount / state.pageSize);
          }
          // Default case
          else {
            state.projects = [];
            state.totalCount = 0;
            state.pageCount = 0;
          }
        } else {
          // Fallback for unexpected payload structure
          state.projects = [];
          state.totalCount = 0;
          state.pageCount = 0;
        }
      })
      .addCase(getExploreProjectsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Get my projects (for Dashboard)
      .addCase(getMyProjectsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyProjectsThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        // Handle pagination response (same logic as getExploreProjectsThunk)
        if (action.payload && typeof action.payload === "object") {
          const payload = action.payload as {
            projects?: Project[];
            totalCount?: number;
            pageCount?: number;
            currentPage?: number;
          };

          if (Array.isArray(payload.projects)) {
            state.projects = payload.projects;
            state.totalCount = payload.totalCount || payload.projects.length;
            state.pageCount =
              payload.pageCount || Math.ceil(state.totalCount / state.pageSize);

            if (payload.currentPage) {
              state.currentPage = payload.currentPage;
            }
          } else if (Array.isArray(action.payload)) {
            state.projects = action.payload as Project[];
            state.totalCount = action.payload.length;
            state.pageCount = Math.ceil(state.totalCount / state.pageSize);
          } else {
            state.projects = [];
            state.totalCount = 0;
            state.pageCount = 0;
          }
        } else {
          state.projects = [];
          state.totalCount = 0;
          state.pageCount = 0;
        }
      })
      .addCase(getMyProjectsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Get project by ID
      .addCase(getProjectByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(getProjectByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Don't show toast here - let components handle error display
      })

      // Create project
      .addCase(createProjectThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        const newProject = action.payload as Project | undefined;
        if (newProject && (newProject as Project).id) {
          state.projects.push(newProject as Project);
        }
        state.successMessage = "Project created successfully";
        toast.success(state.successMessage);
      })
      .addCase(createProjectThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Update project
      .addCase(updateProjectThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProjectThunk.fulfilled, (state, action) => {
        state.isUpdating = false;

        // Check if payload exists and has required properties
        if (!action.payload || !action.payload.id) {
          state.error = "Invalid response from server";
          toast.error("Failed to update project - invalid response");
          return;
        }

        const index = state.projects.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
        state.successMessage = "Project updated successfully";
        toast.success(state.successMessage);
      })
      .addCase(updateProjectThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Delete project
      .addCase(deleteProjectThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProjectThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
        state.successMessage = "Project deleted successfully";
        toast.success(state.successMessage);
      })
      .addCase(deleteProjectThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Approve join request
      .addCase(approveJoinRequestThunk.pending, (state) => {
        state.isManagingRequests = true;
        state.error = null;
      })
      .addCase(approveJoinRequestThunk.fulfilled, (state, action) => {
        state.isManagingRequests = false;
        const { projectId, memberId } = action.payload;

        // Update current project member status if it's loaded
        if (state.currentProject?.id === projectId) {
          const memberIndex = state.currentProject.members.findIndex(
            (m) => m.id === memberId || m.userId === memberId
          );
          if (memberIndex !== -1) {
            state.currentProject.members[memberIndex].approvedStatus =
              "APPROVED";
            state.currentProject.members[memberIndex].approvedUpdateDate =
              new Date().toISOString();
          }
        }

        state.successMessage = "Join request approved successfully";
        toast.success(state.successMessage);
      })
      .addCase(approveJoinRequestThunk.rejected, (state, action) => {
        state.isManagingRequests = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Reject join request
      .addCase(rejectJoinRequestThunk.pending, (state) => {
        state.isManagingRequests = true;
        state.error = null;
      })
      .addCase(rejectJoinRequestThunk.fulfilled, (state, action) => {
        state.isManagingRequests = false;
        const { projectId, memberId } = action.payload;

        // Update current project member status if it's loaded
        if (state.currentProject?.id === projectId) {
          const memberIndex = state.currentProject.members.findIndex(
            (m) => m.id === memberId || m.userId === memberId
          );
          if (memberIndex !== -1) {
            state.currentProject.members[memberIndex].approvedStatus =
              "REJECTED";
            state.currentProject.members[memberIndex].approvedUpdateDate =
              new Date().toISOString();
          }
        }

        state.successMessage = "Join request rejected successfully";
        toast.success(state.successMessage);
      })
      .addCase(rejectJoinRequestThunk.rejected, (state, action) => {
        state.isManagingRequests = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Join project
      .addCase(joinProjectThunk.pending, (state) => {
        state.isJoining = true;
        state.error = null;
      })
      .addCase(joinProjectThunk.fulfilled, (state, action) => {
        state.isJoining = false;
        const { message } = action.payload;
        state.successMessage = message || "Successfully applied to project";
        toast.success(state.successMessage);
      })
      .addCase(joinProjectThunk.rejected, (state, action) => {
        state.isJoining = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Remove member
      .addCase(removeMemberThunk.pending, (state) => {
        state.isRemovingMember = true;
        state.error = null;
      })
      .addCase(removeMemberThunk.fulfilled, (state, action) => {
        state.isRemovingMember = false;
        const { memberId, message } = action.payload;

        // Remove member from currentProject if it exists
        if (state.currentProject && state.currentProject.members) {
          // Instead of removing from array, mark member as REMOVED
          // This matches the backend behavior
          const memberFound = state.currentProject.members.find((member) => {
            const memberIdStr = member.id?.toString() || "";
            const memberUserIdStr = member.userId?.toString() || "";
            const targetIdStr = memberId?.toString() || "";

            return (
              memberIdStr === targetIdStr ||
              memberUserIdStr === targetIdStr ||
              member.id === memberId ||
              member.userId === memberId
            );
          });

          if (memberFound) {
            // Mark as removed instead of removing from array
            memberFound.approvedStatus = "REMOVED";
            memberFound.isRemoved = true;
            memberFound.removeDate = new Date().toISOString();

            // Now filter out removed members from the display
            state.currentProject.members = state.currentProject.members.filter(
              (member) =>
                !member.isRemoved &&
                member.approvedStatus !== "REMOVED" &&
                member.approvedStatus !== "removed"
            );
          }
        }

        state.successMessage =
          message || "Đã loại thành viên khỏi dự án thành công";
        toast.success(state.successMessage);
      })
      .addCase(removeMemberThunk.rejected, (state, action) => {
        state.isRemovingMember = false;
        state.error = action.payload as string;
        toast.error(state.error);
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentProject,
  clearCurrentProject,
  setCurrentPage,
  setPageSize,
  resetPagination,
} = projectsSlice.actions;
export default projectsSlice.reducer;
