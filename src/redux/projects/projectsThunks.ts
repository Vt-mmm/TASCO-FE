import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_PROJECTS } from "../../constants/routesApiKeys";
import { VieMessageConstant } from "../../constants/VieMessageConstant";
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateMemberStatusRequest,
} from "../../common/models/project";
import { ApiResponse } from "../../common/models/common";
import { AxiosError } from "axios";
import { ROUTES_API_PROJECT_MEMBERS } from "../../constants/routesApiKeys";

// Interface for project API response
interface ProjectApiResponse {
  success?: boolean;
  data?:
    | {
        projects?: Project[];
        totalCount?: number;
        pageCount?: number;
        currentPage?: number;
      }
    | Project[];
  projects?: Project[];
  totalCount?: number;
  pageCount?: number;
  currentPage?: number;
}

// Interface for Redux state
interface RootState {
  auth?: {
    userAuth?: {
      userId?: string;
    };
  };
}

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

      // Build query parameters
      const queryParams = new URLSearchParams({
        role: role,
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

      const rawPayload: unknown =
        (axiosResp as { data?: unknown }).data ?? axiosResp;

      let projectsData: Project[] = [];
      let totalCount = 0;
      let pageCount = 0;
      let currentPage = pageNumber;

      // Handle pagination response (same logic as getAllProjectsThunk)
      if (rawPayload && typeof rawPayload === "object") {
        const payload = rawPayload as ProjectApiResponse;

        // If it's directly an array
        if (Array.isArray(rawPayload)) {
          projectsData = rawPayload as Project[];
          // Don't paginate here - we'll filter first then paginate
        }
        // Check if it's a success response with data field
        else if (payload.success && payload.data) {
          if (Array.isArray(payload.data)) {
            projectsData = payload.data;
            // Don't paginate here - we'll filter first then paginate
          } else if (
            payload.data &&
            typeof payload.data === "object" &&
            "projects" in payload.data
          ) {
            const dataWithProjects = payload.data as {
              projects?: Project[];
              totalCount?: number;
              pageCount?: number;
              currentPage?: number;
            };
            if (Array.isArray(dataWithProjects.projects)) {
              projectsData = dataWithProjects.projects;
              totalCount = dataWithProjects.totalCount || 0;
              pageCount =
                dataWithProjects.pageCount || Math.ceil(totalCount / pageSize);
              currentPage = dataWithProjects.currentPage || pageNumber;
            }
          }
        }
        // Other response format handling...
        else if (
          payload.data &&
          typeof payload.data === "object" &&
          "projects" in payload.data
        ) {
          const dataWithProjects = payload.data as {
            projects?: Project[];
            totalCount?: number;
            pageCount?: number;
            currentPage?: number;
          };
          if (Array.isArray(dataWithProjects.projects)) {
            projectsData = dataWithProjects.projects;
            totalCount =
              dataWithProjects.totalCount || dataWithProjects.projects.length;
            pageCount =
              dataWithProjects.pageCount || Math.ceil(totalCount / pageSize);
            currentPage = dataWithProjects.currentPage || pageNumber;
          }
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
      const state = getState() as RootState;
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
            approvedStatus === "approved" || approvedStatus === "APPROVED";

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
        const payload = rawPayload as ProjectApiResponse;

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
          if (Array.isArray(payload.data)) {
            // data is direct array
            projectsData = payload.data;
            totalCount = projectsData.length;
            pageCount = Math.ceil(totalCount / pageSize);
          } else if (
            payload.data &&
            typeof payload.data === "object" &&
            "projects" in payload.data
          ) {
            const dataWithProjects = payload.data as {
              projects?: Project[];
              totalCount?: number;
              pageCount?: number;
              currentPage?: number;
            };
            if (Array.isArray(dataWithProjects.projects)) {
              projectsData = dataWithProjects.projects;
              totalCount = dataWithProjects.totalCount || 0;
              pageCount =
                dataWithProjects.pageCount || Math.ceil(totalCount / pageSize);
              currentPage = dataWithProjects.currentPage || pageNumber;
            }
          }
        }
        // Check if data field contains projects directly
        else if (
          payload.data &&
          typeof payload.data === "object" &&
          "projects" in payload.data
        ) {
          const dataWithProjects = payload.data as {
            projects?: Project[];
            totalCount?: number;
            pageCount?: number;
            currentPage?: number;
          };
          if (Array.isArray(dataWithProjects.projects)) {
            projectsData = dataWithProjects.projects;
            totalCount =
              dataWithProjects.totalCount || dataWithProjects.projects.length;
            pageCount =
              dataWithProjects.pageCount || Math.ceil(totalCount / pageSize);
            currentPage = dataWithProjects.currentPage || pageNumber;
          }
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
  async (
    params: string | { projectId: string; forceRefresh?: boolean },
    { rejectWithValue }
  ) => {
    try {
      // Handle both string and object parameters for backward compatibility
      const projectId = typeof params === "string" ? params : params.projectId;
      const forceRefresh =
        typeof params === "string" ? false : params.forceRefresh || false;

      // Add cache busting parameter if force refresh
      const url = forceRefresh
        ? `${ROUTES_API_PROJECTS.GET_BY_ID(projectId)}?_t=${Date.now()}`
        : ROUTES_API_PROJECTS.GET_BY_ID(projectId);

      const response = await callApiWithRetry(() => axiosClient.get(url));

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

      // Filter out removed members
      if (projectData.members) {
        // Filter out members that are marked as removed or have REMOVED status
        projectData.members = projectData.members.filter(
          (member) =>
            !member.isRemoved &&
            member.approvedStatus !== "REMOVED" &&
            member.approvedStatus !== "removed"
        );
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
    { rejectWithValue, getState }
  ) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.put<ApiResponse<Project>>(
          ROUTES_API_PROJECTS.UPDATE(projectId),
          projectData
        )
      );

      // If API returns boolean true instead of project object
      if (typeof response.data === "boolean" && response.data === true) {
        // Get current project from state to preserve other fields
        const state = getState() as { projects: { projects: Project[] } };
        const currentProject = state.projects.projects.find(
          (p: Project) => p.id === projectId
        );

        if (currentProject) {
          return {
            ...currentProject,
            name: projectData.name || currentProject.name,
            description: projectData.description || currentProject.description,
            updatedAt: new Date().toISOString(),
          } as Project;
        } else {
          throw new Error("Could not find project to update");
        }
      }

      // If API returns proper ApiResponse structure
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return response.data.data;
      }

      throw new Error("Unexpected response format from server");
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
        const response = rawResponse as ApiResponse<{
          projectId: string;
          message: string;
        }>;
        if (response.success) {
          return {
            projectId,
            message:
              response.message || VieMessageConstant.ProjectApplySuccessfully,
          };
        } else {
          throw new Error(
            response.message || VieMessageConstant.ProjectApplyFailed
          );
        }
      } else {
        // If no success field, assume success if we get here without throwing
        return {
          projectId,
          message: VieMessageConstant.ProjectApplySuccessfully,
        };
      }
    } catch (error) {
      const err = error as AxiosError<{
        message: string;
        success: boolean;
        statusCode: number;
      }>;

      // Check if error object has the response data directly (interceptor might flatten it)
      let errorData: Record<string, unknown> | null = null;
      let errorStatus: number | undefined = undefined;

      if (err.response) {
        errorData = err.response.data as Record<string, unknown>;
        errorStatus = err.response.status;
      } else if ((error as Record<string, unknown>).data) {
        // Sometimes interceptors flatten the error structure
        errorData = (error as Record<string, unknown>).data as Record<
          string,
          unknown
        >;
        errorStatus = (error as Record<string, unknown>).status as number;
      } else if (
        (error as Record<string, unknown>).status &&
        (error as Record<string, unknown>).message
      ) {
        // Direct error object
        errorData = { message: (error as Record<string, unknown>).message };
        errorStatus = (error as Record<string, unknown>).status as number;
      }

      // Check if we have no usable error information
      if (!errorData && !errorStatus) {
        return rejectWithValue("Lỗi kết nối mạng. Vui lòng thử lại.");
      }

      // Handle specific error cases
      let errorMessage = VieMessageConstant.ProjectApplyFailed;

      if (errorStatus === 400 && errorData) {
        // Try to extract message from different possible structures
        let backendMessage = "";
        if (typeof errorData === "string") {
          backendMessage = errorData;
        } else if (errorData && typeof errorData === "object") {
          // Handle case insensitive message property
          backendMessage =
            (errorData.message as string) ||
            (errorData.Message as string) ||
            (errorData.error as string) ||
            (errorData.Error as string) ||
            "";
        }

        // Check specific error scenarios - IMPORTANT: "You Have approved to Project" means user was removed but trying to rejoin
        const message = backendMessage.toLowerCase();

        if (
          message.includes("you have approved to project") ||
          message.includes("already approved") ||
          message.includes("đã được phê duyệt") ||
          message.includes("bạn đã được chấp nhận")
        ) {
          // This actually means the user was removed and cannot rejoin
          errorMessage = VieMessageConstant.ProjectApplyRemovedUser;
        } else if (
          message.includes("removed") ||
          message.includes("đã bị loại") ||
          message.includes("không thể tham gia lại") ||
          message.includes("member was removed") ||
          message.includes("user has been removed") ||
          message.includes("banned") ||
          message.includes("cấm") ||
          message.includes("cannot rejoin") ||
          message.includes("không được phép") ||
          message.includes("invalid status transition") ||
          message.includes("status cannot be changed")
        ) {
          errorMessage = VieMessageConstant.ProjectApplyRemovedUser;
        } else if (
          message.includes("already exists") ||
          message.includes("already member") ||
          message.includes("đã tồn tại") ||
          message.includes("đã là thành viên") ||
          message.includes("duplicate")
        ) {
          errorMessage = VieMessageConstant.ProjectApplyAlreadyExists;
        } else if (
          message.includes("pending") ||
          message.includes("đang chờ")
        ) {
          errorMessage = VieMessageConstant.ProjectApplyPending;
        } else if (
          message.includes("invalid") ||
          message.includes("không hợp lệ")
        ) {
          errorMessage = VieMessageConstant.ProjectApplyInvalidStatus;
        } else {
          // Use the exact message from backend if available
          errorMessage =
            backendMessage || VieMessageConstant.ProjectApplyFailed;
        }
      } else if (errorStatus === 403) {
        errorMessage = VieMessageConstant.ProjectApplyNoPermission;
      } else if (errorStatus === 404) {
        errorMessage = VieMessageConstant.ProjectApplyNotFound;
      } else {
        // Try to get message from errorData if available
        const fallbackMessage =
          errorData && typeof errorData === "object"
            ? (errorData.message as string) ||
              (errorData.Message as string) ||
              ""
            : "";
        errorMessage = fallbackMessage || VieMessageConstant.ProjectApplyFailed;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Remove a member from project
export const removeMemberThunk = createAsyncThunk(
  "projects/removeMember",
  async (
    params: {
      projectId: string;
      memberId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { projectId, memberId } = params;

      const axiosResp = await callApiWithRetry(() =>
        axiosClient.delete(
          ROUTES_API_PROJECT_MEMBERS.DELETE_MEMBER(projectId, memberId)
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
        const response = rawResponse as ApiResponse<{
          projectId: string;
          memberId: string;
        }>;
        if (response.success) {
          return {
            projectId,
            memberId,
            message:
              response.message || "Đã loại thành viên khỏi dự án thành công",
          };
        } else {
          throw new Error(
            response.message || "Không thể loại thành viên khỏi dự án"
          );
        }
      } else {
        // If no success field, assume success if we get here without throwing
        return {
          projectId,
          memberId,
          message: "Đã loại thành viên khỏi dự án thành công",
        };
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Không thể loại thành viên khỏi dự án"
      );
    }
  }
);
