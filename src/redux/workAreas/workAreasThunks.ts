import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_WORK_AREAS } from "../../constants/routesApiKeys";
import {
  WorkArea,
  CreateWorkAreaRequest,
  UpdateWorkAreaRequest,
  WorkTask,
} from "../../common/models/workArea";
import { AxiosError } from "axios";

// Interface for API error responses
interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}

// Interface for backend work task response
interface BackendWorkTaskResponse {
  id: string;
  title?: string;
  Title?: string; // Backend may return Title (capital T)
  name?: string;
  description?: string;
  workAreaId: string;
  status?: string;
  priority?: string;
  assignedToId?: string;
  dueDate?: string;
  DueDate?: string; // Backend may return DueDate (capital D)
  createdAt: string;
  updatedAt: string;
  taskObjectives?: unknown[];
}

// Interface for backend work area response
interface BackendWorkAreaResponse {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  displayOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  workTasks?: BackendWorkTaskResponse[];
}

// Helper function to map backend work task to frontend model
function mapWorkTaskToFrontendModel(
  backendTask: BackendWorkTaskResponse
): WorkTask {
  return {
    id: backendTask.id,
    name: backendTask.Title || backendTask.title || backendTask.name || "", // Backend uses 'Title'
    description: backendTask.description,
    workAreaId: backendTask.workAreaId,
    status:
      (backendTask.status
        ?.toLowerCase()
        .replace("_", "-") as WorkTask["status"]) || "todo",
    priority:
      (backendTask.priority?.toLowerCase() as WorkTask["priority"]) || "medium",
    assignedToId: backendTask.assignedToId,
    dueDate: backendTask.dueDate || backendTask.DueDate, // Handle both formats
    createdAt: backendTask.createdAt,
    updatedAt: backendTask.updatedAt,
    taskObjectives: (backendTask.taskObjectives ||
      []) as WorkTask["taskObjectives"],
  };
}

// Helper function to map backend work area to frontend model
function mapWorkAreaToFrontendModel(
  backendWorkArea: BackendWorkAreaResponse
): WorkArea {
  return {
    id: backendWorkArea.id,
    name: backendWorkArea.name,
    description: backendWorkArea.description,
    projectId: backendWorkArea.projectId,
    displayOrder: backendWorkArea.displayOrder,
    status:
      (backendWorkArea.status?.toLowerCase() as WorkArea["status"]) || "active",
    createdAt: backendWorkArea.createdAt,
    updatedAt: backendWorkArea.updatedAt,
    workTasks: backendWorkArea.workTasks?.map(mapWorkTaskToFrontendModel) || [],
  };
}

async function callApiWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
      return await apiCall();
    } catch (error) {
      lastError = error;
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) break;
    }
  }
  throw lastError;
}

// Get WorkAreas by Project ID
export const getWorkAreasByProjectThunk = createAsyncThunk(
  "workAreas/getByProject",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_WORK_AREAS.GET_BY_PROJECT(projectId))
      );

      let backendWorkAreasData: BackendWorkAreaResponse[] = [];

      // First check if response has workAreas property directly
      if (
        response &&
        typeof response === "object" &&
        "workAreas" in response &&
        Array.isArray(response.workAreas)
      ) {
        // Direct response: { workAreas: [...], totalCount: ..., pageCount: ..., currentPage: ... }
        backendWorkAreasData = response.workAreas as BackendWorkAreaResponse[];
      }
      // Check if response is axios response object (has .data property)
      else if (response && typeof response === "object" && "data" in response) {
        const responseData = response.data;

        // Handle different response structures
        if (responseData && typeof responseData === "object") {
          if (
            "workAreas" in responseData &&
            Array.isArray(responseData.workAreas)
          ) {
            // Nested response: { data: { workAreas: [...], totalCount: ..., pageCount: ..., currentPage: ... } }
            backendWorkAreasData =
              responseData.workAreas as BackendWorkAreaResponse[];
          } else if (
            "data" in responseData &&
            Array.isArray(responseData.data)
          ) {
            // Backend returns: { data: [...] }
            backendWorkAreasData =
              responseData.data as BackendWorkAreaResponse[];
          } else if (Array.isArray(responseData)) {
            // Backend returns array directly
            backendWorkAreasData = responseData as BackendWorkAreaResponse[];
          }
        }
      } else if (Array.isArray(response)) {
        // callApiWithRetry returned raw array directly
        backendWorkAreasData = response as BackendWorkAreaResponse[];
      }

      // Map backend data to frontend models
      const workAreasData: WorkArea[] = backendWorkAreasData.map(
        mapWorkAreaToFrontendModel
      );

      return {
        projectId,
        workAreas: workAreasData,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to fetch work areas"
      );
    }
  }
);

// Get WorkArea by ID
export const getWorkAreaByIdThunk = createAsyncThunk(
  "workAreas/getById",
  async (
    { projectId, workAreaId }: { projectId: string; workAreaId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_WORK_AREAS.GET_BY_ID(projectId, workAreaId))
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to fetch work area"
      );
    }
  }
);

// Create WorkArea
export const createWorkAreaThunk = createAsyncThunk(
  "workAreas/create",
  async (
    {
      projectId,
      workAreaData,
    }: { projectId: string; workAreaData: CreateWorkAreaRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.post(ROUTES_API_WORK_AREAS.CREATE(projectId), workAreaData)
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to create work area"
      );
    }
  }
);

// Update WorkArea
export const updateWorkAreaThunk = createAsyncThunk(
  "workAreas/update",
  async (
    {
      projectId,
      workAreaId,
      workAreaData,
    }: {
      projectId: string;
      workAreaId: string;
      workAreaData: UpdateWorkAreaRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.put(
          ROUTES_API_WORK_AREAS.UPDATE(projectId, workAreaId),
          workAreaData
        )
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to update work area"
      );
    }
  }
);

// Delete WorkArea
export const deleteWorkAreaThunk = createAsyncThunk(
  "workAreas/delete",
  async (
    { projectId, workAreaId }: { projectId: string; workAreaId: string },
    { rejectWithValue }
  ) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.delete(ROUTES_API_WORK_AREAS.DELETE(projectId, workAreaId))
      );

      return workAreaId;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to delete work area"
      );
    }
  }
);
