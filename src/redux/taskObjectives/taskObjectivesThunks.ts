import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_TASK_OBJECTIVES } from "../../constants/routesApiKeys";
import {
  TaskObjective,
  CreateTaskObjectiveRequest,
  UpdateTaskObjectiveRequest,
} from "../../common/models/workArea";

// Error response interface
interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}

// Helper function for API retry logic
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
        break; // Don't retry auth errors
      }
    }
  }
  throw lastError;
}

// Backend API request interfaces
interface CreateTaskObjectiveApiRequest {
  title: string;
  description?: string;
  displayOrder?: number;
}

interface UpdateTaskObjectiveApiRequest {
  title?: string;
  description?: string;
  displayOrder?: number;
}

interface CompleteTaskObjectiveApiRequest {
  isCompleted: boolean; // camelCase to match Swagger API documentation
  id: string;
  workTaskId: string;
  title: string;
  description: string;
  displayOrder: string;
  completedByUserId: string;
}

// Backend response interface
interface BackendTaskObjectiveResponse {
  id: string;
  workTaskId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  displayOrder: number;
  createdDate: string;
  completedDate?: string;
  createdByUserId: string;
  completedByUserId?: string;
}

// Backend response structure with taskObjectives property
interface BackendTaskObjectivesListResponse {
  taskObjectives: BackendTaskObjectiveResponse[];
  totalCount?: number;
  [key: string]: unknown;
}

// Union type for all possible response formats
type TaskObjectivesApiResponse =
  | {
      data:
        | BackendTaskObjectiveResponse[]
        | { taskObjectives: BackendTaskObjectiveResponse[] }
        | { data: BackendTaskObjectiveResponse[] };
    }
  | BackendTaskObjectivesListResponse
  | BackendTaskObjectiveResponse[];

// Helper function to map frontend request to backend API format
function mapToApiRequest(
  frontendRequest: CreateTaskObjectiveRequest
): CreateTaskObjectiveApiRequest {
  return {
    title: frontendRequest.title,
    description: frontendRequest.description,
    displayOrder: frontendRequest.displayOrder || 0,
  };
}

function mapUpdateToApiRequest(
  frontendRequest: UpdateTaskObjectiveRequest
): UpdateTaskObjectiveApiRequest {
  return {
    title: frontendRequest.title,
    description: frontendRequest.description,
    displayOrder: frontendRequest.displayOrder,
  };
}

// Helper function to map backend response to frontend model
function mapToFrontendModel(
  backendResponse: BackendTaskObjectiveResponse
): TaskObjective {
  return {
    id: backendResponse.id,
    workTaskId: backendResponse.workTaskId,
    title: backendResponse.title,
    description: backendResponse.description,
    isCompleted: backendResponse.isCompleted,
    displayOrder: backendResponse.displayOrder,
    createdDate: backendResponse.createdDate,
    completedDate: backendResponse.completedDate,
    createdByUserId: backendResponse.createdByUserId,
    completedByUserId: backendResponse.completedByUserId,
  };
}

// Get task objectives by work task ID
export const getTaskObjectivesByWorkTaskThunk = createAsyncThunk(
  "taskObjectives/getByWorkTask",
  async (workTaskId: string, { rejectWithValue }) => {
    try {
      const response = (await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_TASK_OBJECTIVES.GET_BY_WORK_TASK(workTaskId))
      )) as TaskObjectivesApiResponse;

      let objectivesData: TaskObjective[] = [];

      // Handle different response structures
      if (
        response &&
        typeof response === "object" &&
        !Array.isArray(response)
      ) {
        if ("data" in response) {
          // Response wrapped in { data: {...} }
          const responseData = response.data;

          if (responseData && typeof responseData === "object") {
            if (
              "taskObjectives" in responseData &&
              Array.isArray(responseData.taskObjectives)
            ) {
              // Backend returns: { data: { taskObjectives: [...] } }
              objectivesData = (
                responseData.taskObjectives as BackendTaskObjectiveResponse[]
              ).map(mapToFrontendModel);
            } else if (
              "data" in responseData &&
              Array.isArray(responseData.data)
            ) {
              // Backend returns: { data: { data: [...] } }
              objectivesData = (
                responseData.data as BackendTaskObjectiveResponse[]
              ).map(mapToFrontendModel);
            } else if (Array.isArray(responseData)) {
              // Backend returns: { data: [...] }
              objectivesData = (
                responseData as BackendTaskObjectiveResponse[]
              ).map(mapToFrontendModel);
            }
          }
        } else if (
          "taskObjectives" in response &&
          Array.isArray(
            (response as BackendTaskObjectivesListResponse).taskObjectives
          )
        ) {
          // Backend returns directly: { taskObjectives: [...], totalCount: 3, ... }
          const typedResponse = response as BackendTaskObjectivesListResponse;
          objectivesData = typedResponse.taskObjectives.map(mapToFrontendModel);
        } else if (Array.isArray(response)) {
          // Backend returns array directly
          objectivesData = (response as BackendTaskObjectiveResponse[]).map(
            mapToFrontendModel
          );
        }
      } else if (Array.isArray(response)) {
        // callApiWithRetry returned raw array directly
        const arrayResponse = response as BackendTaskObjectiveResponse[];
        objectivesData = arrayResponse.map(mapToFrontendModel);
      }

      // Sort by display order
      objectivesData.sort((a, b) => a.displayOrder - b.displayOrder);

      return {
        workTaskId,
        objectives: objectivesData,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to fetch task objectives"
      );
    }
  }
);

// Get task objective by ID
export const getTaskObjectiveByIdThunk = createAsyncThunk(
  "taskObjectives/getById",
  async (
    { workTaskId, objectiveId }: { workTaskId: string; objectiveId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get(
          ROUTES_API_TASK_OBJECTIVES.GET_BY_ID(workTaskId, objectiveId)
        )
      );

      // Handle nested response structure
      let objectiveData = response.data;
      if (
        objectiveData &&
        typeof objectiveData === "object" &&
        "data" in objectiveData
      ) {
        objectiveData = objectiveData.data;
      }

      return mapToFrontendModel(objectiveData);
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to fetch task objective"
      );
    }
  }
);

// Create task objective
export const createTaskObjectiveThunk = createAsyncThunk(
  "taskObjectives/create",
  async (
    {
      workTaskId,
      objectiveData,
    }: { workTaskId: string; objectiveData: CreateTaskObjectiveRequest },
    { rejectWithValue }
  ) => {
    try {
      const apiRequest = mapToApiRequest(objectiveData);

      const response = await callApiWithRetry(() =>
        axiosClient.post(
          ROUTES_API_TASK_OBJECTIVES.CREATE(workTaskId),
          apiRequest
        )
      );

      // Handle nested response structure
      let objectiveResponseData = response.data;
      if (objectiveResponseData && typeof objectiveResponseData === "object") {
        if (
          objectiveResponseData.success === true &&
          objectiveResponseData.data
        ) {
          objectiveResponseData = objectiveResponseData.data;
        } else if (objectiveResponseData.success === false) {
          throw new Error(
            objectiveResponseData.message || "Failed to create task objective"
          );
        }
      }

      return mapToFrontendModel(objectiveResponseData);
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to create task objective"
      );
    }
  }
);

// Update task objective
export const updateTaskObjectiveThunk = createAsyncThunk(
  "taskObjectives/update",
  async (
    {
      workTaskId,
      objectiveId,
      objectiveData,
    }: {
      workTaskId: string;
      objectiveId: string;
      objectiveData: UpdateTaskObjectiveRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      const apiRequest = mapUpdateToApiRequest(objectiveData);

      const response = await callApiWithRetry(() =>
        axiosClient.put(
          ROUTES_API_TASK_OBJECTIVES.UPDATE(workTaskId, objectiveId),
          apiRequest
        )
      );

      // Handle nested response structure
      let objectiveResponseData = response.data;
      if (
        objectiveResponseData &&
        typeof objectiveResponseData === "object" &&
        "data" in objectiveResponseData
      ) {
        objectiveResponseData = objectiveResponseData.data;
      }

      return mapToFrontendModel(objectiveResponseData);
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to update task objective"
      );
    }
  }
);

// Delete task objective
export const deleteTaskObjectiveThunk = createAsyncThunk(
  "taskObjectives/delete",
  async (
    { workTaskId, objectiveId }: { workTaskId: string; objectiveId: string },
    { rejectWithValue }
  ) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.delete(
          ROUTES_API_TASK_OBJECTIVES.DELETE(workTaskId, objectiveId)
        )
      );

      return { workTaskId, objectiveId };
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to delete task objective"
      );
    }
  }
);

// Complete/uncomplete task objective
export const completeTaskObjectiveThunk = createAsyncThunk(
  "taskObjectives/complete",
  async (
    {
      workTaskId,
      objectiveId,
      isCompleted,
      objectiveData,
    }: {
      workTaskId: string;
      objectiveId: string;
      isCompleted: boolean;
      objectiveData: TaskObjective;
    },
    { rejectWithValue }
  ) => {
    try {
      const apiRequest: CompleteTaskObjectiveApiRequest = {
        isCompleted: isCompleted,
        id: objectiveId,
        workTaskId: workTaskId,
        title: objectiveData.title,
        description: objectiveData.description || "",
        displayOrder: objectiveData.displayOrder.toString(),
        completedByUserId: "", // Will be set by backend from auth token
      };

      const response = await callApiWithRetry(() =>
        axiosClient.put(
          ROUTES_API_TASK_OBJECTIVES.COMPLETE(workTaskId, objectiveId),
          apiRequest
        )
      );

      // Handle nested response structure
      let objectiveResponseData = response.data;
      if (
        objectiveResponseData &&
        typeof objectiveResponseData === "object" &&
        "data" in objectiveResponseData
      ) {
        objectiveResponseData = objectiveResponseData.data;
      }

      return mapToFrontendModel(objectiveResponseData);
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        (axiosError.response?.data as ApiErrorResponse)?.message ||
          axiosError.message ||
          "Failed to update task objective completion"
      );
    }
  }
);
