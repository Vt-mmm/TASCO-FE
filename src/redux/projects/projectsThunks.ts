import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_PROJECTS } from "../../constants/routesApiKeys";
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateMemberStatusRequest,
} from "../../common/models/project";
import { ApiResponse } from "../../common/models/common";
import { AxiosError } from "axios";
import { ROUTES_API_PROJECT_MEMBERS } from "../../constants/routesApiKeys";

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
      return await apiCall();
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

// Get user's joined projects (for Dashboard)
export const getMyProjectsThunk = createAsyncThunk(
  "projects/getMy",
  async (
    params: {
      role?: string;
      pageSize?: number;
      pageNumber?: number;
      search?: string;
      isDelete?: boolean;
    } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const {
        role = "",
        pageSize = 10,
        pageNumber = 1,
        search = "",
        isDelete = false,
      } = params;

      // Build query parameters for my-project endpoint
      const queryParams = new URLSearchParams({
        role: role,
        pageSize: pageSize.toString(),
        pageNumber: pageNumber.toString(),
        search: search,
        isDelete: isDelete.toString(),
      });

      const axiosResp = await callApiWithRetry(() =>
        axiosClient.get(
          `${ROUTES_API_PROJECTS.GET_ALL}/my-project?${queryParams.toString()}`
        )
      );

      const rawPayload: unknown =
        (axiosResp as { data?: unknown }).data ?? axiosResp;

      let projectsData: Project[] = [];
      let totalCount = 0;
      let pageCount = 0;
      let currentPage = pageNumber;

      // Handle pagination response (same logic as getAllProjectsThunk)
      if (rawPayload && typeof rawPayload === "object") {
        const payload = rawPayload as any;

        // If it's directly an array
        if (Array.isArray(rawPayload)) {
          projectsData = rawPayload as Project[];
          // Don't paginate here - we'll filter first then paginate
        }
        // Check if it's a success response with data field
        else if (payload.success && payload.data) {
          if (Array.isArray(payload.data.projects)) {
            projectsData = payload.data.projects;
            totalCount = payload.data.totalCount || 0;
            pageCount =
              payload.data.pageCount || Math.ceil(totalCount / pageSize);
            currentPage = payload.data.currentPage || pageNumber;
          } else if (Array.isArray(payload.data)) {
            projectsData = payload.data;
            // Don't paginate here - we'll filter first then paginate
          }
        }
        // Other response format handling...
        else if (payload.data && Array.isArray(payload.data.projects)) {
          projectsData = payload.data.projects;
          totalCount = payload.data.totalCount || payload.data.projects.length;
          pageCount =
            payload.data.pageCount || Math.ceil(totalCount / pageSize);
          currentPage = payload.data.currentPage || pageNumber;
        } else if (payload.data && Array.isArray(payload.data)) {
          projectsData = payload.data as Project[];
          // Don't paginate here - we'll filter first then paginate
        } else if (Array.isArray(payload.projects)) {
          projectsData = payload.projects;
          totalCount = payload.totalCount || payload.projects.length;
          pageCount = payload.pageCount || Math.ceil(totalCount / pageSize);
          currentPage = payload.currentPage || pageNumber;
        }
      }

      // Filter projects FIRST before pagination to only include those where current user has approved membership
      const state = getState() as any;
      const currentUserId = state.auth?.userAuth?.userId;

      if (currentUserId && projectsData.length > 0) {
        projectsData = projectsData.filter((project) => {
          // First check if user is the project owner
          const isProjectOwner = project.ownerId === currentUserId;
          
          if (isProjectOwner) {
            return true; // Project owner always has access
          }

          // If not owner, check membership status
          const userMembership = project.members?.find((member) => {
            return (
              member.userId === currentUserId ||
              member.userId?.toString() === currentUserId?.toString()
            );
          });

          if (!userMembership) {
            return false; // No membership found
          }

          // Check approved status (handle both new and legacy fields)
          const approvedStatus =
            userMembership.approvedStatus || userMembership.status;

          // Check if membership is approved
          const isApprovedStatus =
            approvedStatus === "approved" || 
            approvedStatus === "APPROVED";

          return isApprovedStatus;
        });
      }

      // Now apply pagination to filtered results
      if (projectsData.length > 0) {
        totalCount = projectsData.length;
        pageCount = Math.ceil(totalCount / pageSize);

        // Apply pagination to filtered data
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        projectsData = projectsData.slice(startIndex, endIndex);
      }

      // Final validation
      if (totalCount === 0 && projectsData.length > 0) {
        totalCount = projectsData.length;
      }
      if (pageCount === 0 && totalCount > 0) {
        pageCount = Math.ceil(totalCount / pageSize);
      }

      return {
        projects: projectsData || [],
        totalCount,
        pageCount,
        currentPage,
      };
    } catch (error) {
      console.error("❌ getMyProjectsThunk error:", error);
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch my projects"
      );
    }
  }
);

// Get projects to explore and apply (for Explore page)
export const getExploreProjectsThunk = createAsyncThunk(
  "projects/getExplore",
  async (
    params: {
      pageSize?: number;
      pageNumber?: number;
      search?: string;
      isDelete?: boolean;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const {
        pageSize = 10,
        pageNumber = 1,
        search = "",
        isDelete = false,
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams({
        pageSize: pageSize.toString(),
        pageNumber: pageNumber.toString(),
        search: search,
        isDelete: isDelete.toString(),
      });

      const axiosResp = await callApiWithRetry(() =>
        axiosClient.get(
          `${ROUTES_API_PROJECTS.GET_ALL}?${queryParams.toString()}`
        )
      );

      // Determine raw payload: some interceptors might already return data
      const rawPayload: unknown =
        (axiosResp as { data?: unknown }).data ?? axiosResp;

      let projectsData: Project[] = [];
      let totalCount = 0;
      let pageCount = 0;
      let currentPage = pageNumber;

      // Handle different response structures from backend
      if (rawPayload && typeof rawPayload === "object") {
        const payload = rawPayload as any;

        // If it's directly an array (backend doesn't support pagination yet)
        if (Array.isArray(rawPayload)) {
          projectsData = rawPayload as Project[];
          totalCount = projectsData.length;

          // Calculate pagination manually for array response
          const startIndex = (pageNumber - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          projectsData = projectsData.slice(startIndex, endIndex);
          pageCount = Math.ceil(totalCount / pageSize);
        }
        // Check if it's a success response with data field
        else if (payload.success && payload.data) {
          if (Array.isArray(payload.data.projects)) {
            projectsData = payload.data.projects;
            totalCount = payload.data.totalCount || 0;
            pageCount =
              payload.data.pageCount || Math.ceil(totalCount / pageSize);
            currentPage = payload.data.currentPage || pageNumber;
          } else if (Array.isArray(payload.data)) {
            // data is direct array
            projectsData = payload.data;
            totalCount = projectsData.length;
            pageCount = Math.ceil(totalCount / pageSize);
          }
        }
        // Check if data field contains projects directly
        else if (payload.data && Array.isArray(payload.data.projects)) {
          projectsData = payload.data.projects;
          totalCount = payload.data.totalCount || payload.data.projects.length;
          pageCount =
            payload.data.pageCount || Math.ceil(totalCount / pageSize);
          currentPage = payload.data.currentPage || pageNumber;
        }
        // Check if data field is direct array
        else if (payload.data && Array.isArray(payload.data)) {
          const allProjects = payload.data as Project[];
          totalCount = allProjects.length;

          // Manual pagination
          const startIndex = (pageNumber - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          projectsData = allProjects.slice(startIndex, endIndex);
          pageCount = Math.ceil(totalCount / pageSize);
        }
        // Check if projects array is at root level (backwards compatibility)
        else if (Array.isArray(payload.projects)) {
          projectsData = payload.projects;
          totalCount = payload.totalCount || payload.projects.length;
          pageCount = payload.pageCount || Math.ceil(totalCount / pageSize);
          currentPage = payload.currentPage || pageNumber;
        }
      }

      // Final validation - ensure we have valid pagination data
      if (totalCount === 0 && projectsData.length > 0) {
        totalCount = projectsData.length;
      }
      if (pageCount === 0 && totalCount > 0) {
        pageCount = Math.ceil(totalCount / pageSize);
      }

      return {
        projects: projectsData || [],
        totalCount,
        pageCount,
        currentPage,
      };
    } catch (error) {
      console.error("❌ getAllProjectsThunk error:", error);
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch projects"
      );
    }
  }
);

// Get project by ID
export const getProjectByIdThunk = createAsyncThunk(
  "projects/getById",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_PROJECTS.GET_BY_ID(projectId))
      );

      // callApiWithRetry may return either raw data or axios response
      let projectData: Project;

      // Check if response is axios response object (has .data property)
      if (response && typeof response === "object" && "data" in response) {
        // Handle nested data structure
        if (
          response.data &&
          typeof response.data === "object" &&
          "data" in response.data
        ) {
          projectData = (response.data as { data: Project }).data;
        } else {
          projectData = response.data as Project;
        }
      } else {
        // callApiWithRetry returned raw data directly
        projectData = response as Project;
      }

      // Validate that we have required fields
      if (!projectData || !projectData.id) {
        throw new Error("Invalid project data received");
      }

      return projectData;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch project";
      return rejectWithValue(errorMessage);
    }
  }
);

// Create project
export const createProjectThunk = createAsyncThunk(
  "projects/create",
  async (projectData: CreateProjectRequest, { rejectWithValue }) => {
    try {
      const axiosResp = await callApiWithRetry(() =>
        axiosClient.post(ROUTES_API_PROJECTS.CREATE, projectData)
      );

      const raw: unknown = (axiosResp as { data?: unknown }).data ?? axiosResp;

      const maybeData = (raw as { data?: Project }).data;
      const project = (maybeData ?? (raw as Project)) as Project;

      return project;
    } catch (error) {
      const err = error as AxiosError;

      // BE có thể trả về dạng chuỗi thuần (string) hoặc đối tượng { message: string }
      const backendData = err.response?.data;

      let errorMessage = "Failed to create project";

      if (typeof backendData === "string") {
        errorMessage = backendData;
      } else if (
        backendData &&
        typeof backendData === "object" &&
        "message" in backendData &&
        typeof (backendData as { message?: unknown }).message === "string"
      ) {
        errorMessage = (backendData as { message: string }).message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Update project
export const updateProjectThunk = createAsyncThunk(
  "projects/update",
  async (
    {
      projectId,
      projectData,
    }: { projectId: string; projectData: UpdateProjectRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.put<ApiResponse<Project>>(
          ROUTES_API_PROJECTS.UPDATE(projectId),
          projectData
        )
      );
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update project"
      );
    }
  }
);

// Delete project
export const deleteProjectThunk = createAsyncThunk(
  "projects/delete",
  async (projectId: string, { rejectWithValue }) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.delete(ROUTES_API_PROJECTS.DELETE(projectId))
      );
      return projectId;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete project"
      );
    }
  }
);

// Approve join request
export const approveJoinRequestThunk = createAsyncThunk(
  "projects/approveJoinRequest",
  async (
    {
      projectId,
      memberId,
      ownerId,
    }: { projectId: string; memberId: string; ownerId: string },
    { rejectWithValue }
  ) => {
    try {
      const requestData: UpdateMemberStatusRequest = {
        projectId,
        memberId,
        approvedStatus: "APPROVED",
        ownerId,
      };

      await callApiWithRetry(() =>
        axiosClient.put(
          ROUTES_API_PROJECT_MEMBERS.UPDATE_APPROVED_STATUS(
            projectId,
            memberId
          ),
          requestData
        )
      );

      return { projectId, memberId, status: "approved" };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to approve join request"
      );
    }
  }
);

// Reject join request
export const rejectJoinRequestThunk = createAsyncThunk(
  "projects/rejectJoinRequest",
  async (
    {
      projectId,
      memberId,
      ownerId,
      reason,
    }: {
      projectId: string;
      memberId: string;
      ownerId: string;
      reason?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const requestData: UpdateMemberStatusRequest = {
        projectId,
        memberId,
        approvedStatus: "REJECTED",
        ownerId,
      };

      await callApiWithRetry(() =>
        axiosClient.put(
          ROUTES_API_PROJECT_MEMBERS.UPDATE_APPROVED_STATUS(
            projectId,
            memberId
          ),
          requestData
        )
      );

      return { projectId, memberId, status: "rejected", reason };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to reject join request"
      );
    }
  }
);

// Join/Apply to a project
export const joinProjectThunk = createAsyncThunk(
  "projects/join",
  async (
    params: {
      projectId: string;
      message?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { projectId, message = "" } = params;

      const requestData = {
        message: message,
      };

      const axiosResp = await callApiWithRetry(() =>
        axiosClient.put(
          ROUTES_API_PROJECT_MEMBERS.APPLY_PROJECT(projectId),
          requestData
        )
      );

      // Handle response more safely - axios interceptors might modify the structure
      const rawResponse = axiosResp.data || axiosResp;

      // Check if response has success field
      if (
        rawResponse &&
        typeof rawResponse === "object" &&
        "success" in rawResponse
      ) {
        const response = rawResponse as ApiResponse<any>;
        if (response.success) {
          return {
            projectId,
            message: response.message || "Successfully applied to project",
          };
        } else {
          throw new Error(response.message || "Failed to apply to project");
        }
      } else {
        // If no success field, assume success if we get here without throwing
        return {
          projectId,
          message: "Successfully applied to project",
        };
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to apply to project"
      );
    }
  }
);
