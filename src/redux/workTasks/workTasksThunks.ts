import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axios from "axios"; // Import raw axios for debugging
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_WORK_TASKS } from "../../constants/routesApiKeys";
import {
  WorkTask,
  CreateWorkTaskRequest,
  UpdateWorkTaskRequest,
} from "../../common/models/workArea";
import {
  CreateWorkTaskApiRequest,
  UpdateWorkTaskApiRequest,
} from "../../common/models/task";
import { getAccessToken } from "../../utils"; // Import to get token manually

// Interface for API error responses
interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
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

// Helper function to map frontend request to backend API format
function mapToApiRequest(
  frontendRequest: CreateWorkTaskRequest
): CreateWorkTaskApiRequest {
  // Ensure Title is not empty (required field)
  const title = frontendRequest.title?.trim();
  if (!title) {
    throw new Error("Task title is required");
  }

  // Convert ISO date to YYYY-MM-DD format for backend
  let formattedDueDate = "";
  if (frontendRequest.dueDate) {
    const date = new Date(frontendRequest.dueDate);
    formattedDueDate = date.toISOString().split("T")[0]; // Extract YYYY-MM-DD part
  }

  // Map priority to backend format
  const priorityMap: Record<string, string> = {
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
    urgent: "URGENT",
  };

  const mappedPriority = frontendRequest.priority
    ? priorityMap[frontendRequest.priority.toLowerCase()] || "MEDIUM"
    : "MEDIUM";

  const mappedStatus = "NEW"; // Always create as NEW status

  const result = {
    Title: title, // Backend uses 'Title' (capital T), frontend uses 'name'
    Description: frontendRequest.description || "",
    Priority: mappedPriority,
    DueDate: formattedDueDate, // Backend expects YYYY-MM-DD format
    Status: mappedStatus,
  };

  return result;
}

function mapUpdateToApiRequest(
  frontendRequest: UpdateWorkTaskRequest
): UpdateWorkTaskApiRequest {
  // Ensure Title is not empty if provided (required field)
  const title = frontendRequest.title?.trim();
  if (frontendRequest.title !== undefined && !title) {
    throw new Error("Task title cannot be empty");
  }

  // Format dates to YYYY-MM-DD format for backend
  const formatDateForBackend = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // Extract YYYY-MM-DD part
    } catch {
      return "";
    }
  };

  // Map priority to backend format
  const priorityMap: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };

  // Map status to backend format
  const statusMap: Record<string, string> = {
    todo: "Todo",
    in_progress: "InProgress",
    review: "Review",
    done: "Done",
  };

  const mappedPriority = frontendRequest.priority
    ? priorityMap[frontendRequest.priority.toLowerCase()] ||
      frontendRequest.priority
    : undefined;

  const mappedStatus = frontendRequest.status
    ? statusMap[frontendRequest.status.toLowerCase().replace("_", "")] ||
      frontendRequest.status
    : undefined;

  return {
    Title: title, // Backend uses 'Title' (capital T), frontend uses 'name'
    Description: frontendRequest.description,
    Status: mappedStatus,
    Priority: mappedPriority,
    StartDate: formatDateForBackend(frontendRequest.startDate),
    EndDate: formatDateForBackend(frontendRequest.endDate),
    DueDate: formatDateForBackend(frontendRequest.dueDate),
  };
}

// Interface for backend task response
interface BackendTaskResponse {
  id: string;
  title?: string;
  Title?: string; // Backend may return Title (capital T)
  name?: string;
  description?: string;
  workAreaId: string;
  status?: string;
  priority?: string;
  assignedToId?: string;
  startDate?: string;
  StartDate?: string; // Backend may return StartDate (capital S)
  endDate?: string;
  EndDate?: string; // Backend may return EndDate (capital E)
  dueDate?: string;
  DueDate?: string; // Backend may return DueDate (capital D)
  createdAt: string;
  updatedAt: string;
  taskObjectives?: unknown[];
}

// Helper function to map backend response to frontend model
function mapToFrontendModel(backendResponse: BackendTaskResponse): WorkTask {
  // Map backend status to frontend format
  const mapBackendToFrontendStatus = (
    backendStatus?: string
  ): WorkTask["status"] => {
    if (!backendStatus) return "todo";
    const statusMap: Record<string, WorkTask["status"]> = {
      Todo: "todo",
      InProgress: "in_progress",
      Review: "review",
      Done: "done",
    };
    return statusMap[backendStatus] || "todo";
  };

  // Map backend priority to frontend format
  const mapBackendToFrontendPriority = (
    backendPriority?: string
  ): WorkTask["priority"] => {
    if (!backendPriority) return "medium";
    const priorityMap: Record<string, WorkTask["priority"]> = {
      Low: "low",
      Medium: "medium",
      High: "high",
      Urgent: "urgent",
    };
    return priorityMap[backendPriority] || "medium";
  };

  return {
    id: backendResponse.id,
    name:
      backendResponse.Title ||
      backendResponse.title ||
      backendResponse.name ||
      "", // Backend returns 'Title'
    description: backendResponse.description,
    workAreaId: backendResponse.workAreaId,
    status: mapBackendToFrontendStatus(backendResponse.status),
    priority: mapBackendToFrontendPriority(backendResponse.priority),
    assignedToId: backendResponse.assignedToId,
    startDate: backendResponse.startDate || backendResponse.StartDate, // Handle both formats
    endDate: backendResponse.endDate || backendResponse.EndDate, // Handle both formats
    dueDate: backendResponse.dueDate || backendResponse.DueDate, // Handle both formats
    createdAt: backendResponse.createdAt,
    updatedAt: backendResponse.updatedAt,
    taskObjectives: (backendResponse.taskObjectives ||
      []) as WorkTask["taskObjectives"],
  };
}

// Get WorkTasks by WorkArea ID
export const getWorkTasksByWorkAreaThunk = createAsyncThunk(
  "workTasks/getByWorkArea",
  async (workAreaId: string, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_WORK_TASKS.GET_BY_WORK_AREA(workAreaId))
      );

      let workTasksData: WorkTask[] = [];

      // Handle different response structures
      if (response && typeof response === "object" && "data" in response) {
        const responseData = response.data;

        if (responseData && typeof responseData === "object") {
          if ("data" in responseData && Array.isArray(responseData.data)) {
            // Backend returns: { data: [...] }
            workTasksData = (responseData.data as BackendTaskResponse[]).map(
              mapToFrontendModel
            );
          } else if (Array.isArray(responseData)) {
            // Backend returns array directly
            workTasksData = (responseData as BackendTaskResponse[]).map(
              mapToFrontendModel
            );
          }
        }
      } else if (Array.isArray(response)) {
        // callApiWithRetry returned raw array directly
        workTasksData = (response as BackendTaskResponse[]).map(
          mapToFrontendModel
        );
      }

      return {
        workAreaId,
        workTasks: workTasksData,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to fetch work tasks"
      );
    }
  }
);

// Get WorkTask by ID
export const getWorkTaskByIdThunk = createAsyncThunk(
  "workTasks/getById",
  async (
    { workAreaId, workTaskId }: { workAreaId: string; workTaskId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_WORK_TASKS.GET_BY_ID(workAreaId, workTaskId))
      );

      return mapToFrontendModel(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to fetch work task"
      );
    }
  }
);

// Debug function to bypass interceptors and get raw response
async function debugApiCall(url: string, data: CreateWorkTaskApiRequest) {
  const token = getAccessToken();
  const response = await axios.post(`http://localhost:5000${url}`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    timeout: 10000,
  });

  return response;
}

// Create WorkTask
export const createWorkTaskThunk = createAsyncThunk(
  "workTasks/create",
  async (
    {
      workAreaId,
      workTaskData,
    }: { workAreaId: string; workTaskData: CreateWorkTaskRequest },
    { rejectWithValue }
  ) => {
    try {
      const apiRequest = mapToApiRequest(workTaskData);

      // Use debug API call to bypass interceptors and see raw response
      const url = ROUTES_API_WORK_TASKS.CREATE(workAreaId);
      const response = await debugApiCall(url, apiRequest);

      // Handle backend response format: { success: true, data: workTask }
      let taskData = response.data;

      // Check if response is wrapped in success/data structure
      if (taskData && typeof taskData === "object") {
        if (taskData.success === true && taskData.data) {
          // Backend success response: { success: true, data: actualWorkTask }
          taskData = taskData.data;
        } else if (taskData.success === false) {
          // Backend error response: { success: false, message: "error" }
          throw new Error(taskData.message || "Failed to create work task");
        }
        // If no success field, assume direct work task data
      }

      return mapToFrontendModel(taskData);
    } catch (error) {
      const axiosError = error as AxiosError;

      // Try to get detailed error message from backend
      let errorMessage = "Failed to create work task";
      if (axiosError.response?.data) {
        const responseData = axiosError.response.data as ApiErrorResponse & {
          error?: string;
          details?: string;
        };
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.details) {
          errorMessage = responseData.details;
        } else if (typeof responseData === "string") {
          errorMessage = responseData;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Update WorkTask
export const updateWorkTaskThunk = createAsyncThunk(
  "workTasks/update",
  async (
    {
      workAreaId,
      workTaskId,
      workTaskData,
    }: {
      workAreaId: string;
      workTaskId: string;
      workTaskData: UpdateWorkTaskRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      const apiRequest = mapUpdateToApiRequest(workTaskData);

      const updateUrl = ROUTES_API_WORK_TASKS.UPDATE(workAreaId, workTaskId);

      const response = await callApiWithRetry(() =>
        axiosClient.put(updateUrl, apiRequest)
      );

      // Handle nested response structure
      let taskData = response.data;
      if (taskData && typeof taskData === "object" && "data" in taskData) {
        taskData = taskData.data;
      }

      // TEMPORARY FIX: Check if backend returned empty/invalid response
      if (
        !taskData ||
        (typeof taskData === "object" && (!taskData.id || taskData.id === ""))
      ) {
        // Return the original task data from the request to prevent state corruption
        // This is a temporary workaround until backend is fixed
        return rejectWithValue(
          "Backend UPDATE endpoint returned invalid response. The task may have been duplicated. Please refresh the page and contact the backend team."
        );
      }

      const frontendModel = mapToFrontendModel(taskData);

      return frontendModel;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to update work task"
      );
    }
  }
);

// Delete WorkTask
export const deleteWorkTaskThunk = createAsyncThunk(
  "workTasks/delete",
  async (
    { workAreaId, workTaskId }: { workAreaId: string; workTaskId: string },
    { rejectWithValue }
  ) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.delete(ROUTES_API_WORK_TASKS.DELETE(workAreaId, workTaskId))
      );

      return workTaskId;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to delete work task"
      );
    }
  }
);

// Move WorkTask between WorkAreas using Delete + Create approach
export const moveWorkTaskThunk = createAsyncThunk(
  "workTasks/move",
  async (
    {
      workTaskId,
      fromWorkAreaId,
      toWorkAreaId,
      taskData,
    }: {
      workTaskId: string;
      fromWorkAreaId: string;
      toWorkAreaId: string;
      taskData: CreateWorkTaskRequest; // Changed to CreateWorkTaskRequest since we're creating
    },
    { rejectWithValue }
  ) => {
    try {
      // Step 0: Check if task exists (for logging purposes)
      try {
        await callApiWithRetry(() =>
          axiosClient.get(
            ROUTES_API_WORK_TASKS.GET_BY_ID(fromWorkAreaId, workTaskId)
          )
        );
      } catch (checkError) {
        const axiosError = checkError as AxiosError;

        if (axiosError.response?.status === 404) {
          // Task doesn't exist in backend, will try delete anyway
        } else {
          // Could not verify task existence, will try delete anyway
        }
      }

      // Step 1: Attempt to delete the task from the old work area (ignore failures)
      try {
        await callApiWithRetry(() =>
          axiosClient.delete(
            ROUTES_API_WORK_TASKS.DELETE(fromWorkAreaId, workTaskId)
          )
        );
      } catch {
        // Continue anyway - task might not have existed in backend
      }

      // Step 2: Create the task in the new work area
      const apiRequest = mapToApiRequest(taskData);

      try {
        const response = await callApiWithRetry(() =>
          axiosClient.post(
            ROUTES_API_WORK_TASKS.CREATE(toWorkAreaId),
            apiRequest
          )
        );

        // Handle backend response format: { success: true, data: workTask }
        let taskResponseData = response.data;
        if (taskResponseData && typeof taskResponseData === "object") {
          if (taskResponseData.success === true && taskResponseData.data) {
            taskResponseData = taskResponseData.data;
          } else if (taskResponseData.success === false) {
            throw new Error(
              taskResponseData.message ||
                "Failed to create work task in new area"
            );
          }
        }

        return {
          workTask: mapToFrontendModel(taskResponseData),
          fromWorkAreaId,
          toWorkAreaId,
          originalTaskId: workTaskId, // Keep track of original ID for reference
        };
      } catch (createError) {
        const axiosError = createError as AxiosError;

        // Handle specific create errors
        if (axiosError.response?.status === 400) {
          const errorData = axiosError.response.data as
            | string
            | (ApiErrorResponse & {
                error?: string;
                details?: string;
              });

          if (typeof errorData === "object" && errorData.message) {
            return rejectWithValue(
              `Failed to create task: ${errorData.message}`
            );
          } else if (typeof errorData === "string") {
            return rejectWithValue(`Failed to create task: ${errorData}`);
          }
          return rejectWithValue("Failed to create task due to invalid data");
        }

        // Re-throw to be handled by outer catch
        throw createError;
      }
    } catch (error) {
      const axiosError = error as AxiosError;

      let errorMessage = "Failed to move work task";
      if (axiosError.response?.data) {
        const responseData = axiosError.response.data as ApiErrorResponse & {
          error?: string;
          details?: string;
        };
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.details) {
          errorMessage = responseData.details;
        } else if (typeof responseData === "string") {
          errorMessage = responseData;
        }
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);
