import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_TASK_MEMBERS } from "../../constants/routesApiKeys";
import {
  TaskMember,
  CreateTaskMemberRequest,
  UpdateTaskMemberRequest,
  TaskMemberListResponse,
} from "../../common/models/taskMember";

// Helper function for API calls with retry
async function callApiWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw lastError;
}

// Get task members by task ID
export const getTaskMembersByTaskIdThunk = createAsyncThunk(
  "taskMembers/getByTaskId",
  async (
    params: {
      workTaskId: string;
      pageIndex?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const { workTaskId, pageIndex = 1, pageSize = 10 } = params;
      
      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await callApiWithRetry(() =>
        axiosClient.get(
          `${ROUTES_API_TASK_MEMBERS.GET_BY_WORK_TASK(
            workTaskId
          )}?${queryParams.toString()}`
        )
      );

      // Handle different response structures
      let taskMemberData: TaskMemberListResponse;

      if (response && typeof response === "object" && "data" in response) {
        taskMemberData = response.data as TaskMemberListResponse;
      } else if (response && typeof response === "object" && "taskMembers" in response) {
        // API returns {taskMembers: [], totalCount: number, ...} format
        const apiResponse = response as {
          taskMembers: TaskMember[];
          totalCount: number;
          currentPage: number;
          pageCount: number;
        };
        taskMemberData = {
          members: apiResponse.taskMembers || [],
          totalCount: apiResponse.totalCount || 0,
          pageIndex: apiResponse.currentPage || 1,
          pageSize: pageSize,
          hasNextPage: (apiResponse.currentPage || 1) < (apiResponse.pageCount || 1),
          hasPreviousPage: (apiResponse.currentPage || 1) > 1,
        };
      } else {
        taskMemberData = response as TaskMemberListResponse;
      }
      
      return taskMemberData;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch task members"
      );
    }
  }
);

// Get task member by ID
export const getTaskMemberByIdThunk = createAsyncThunk(
  "taskMembers/getById",
  async (
    params: {
      workTaskId: string;
      memberId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { workTaskId, memberId } = params;

      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_TASK_MEMBERS.GET_BY_ID(workTaskId, memberId))
      );

      let taskMemberData: TaskMember;

      if (response && typeof response === "object" && "data" in response) {
        taskMemberData = response.data as TaskMember;
      } else {
        taskMemberData = response as TaskMember;
      }

      return taskMemberData;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch task member"
      );
    }
  }
);

// Create task member
export const createTaskMemberThunk = createAsyncThunk(
  "taskMembers/create",
  async (
    params: {
      workTaskId: string;
      memberData: CreateTaskMemberRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      const { workTaskId, memberData } = params;
      
      const response = await callApiWithRetry(() =>
        axiosClient.post(ROUTES_API_TASK_MEMBERS.CREATE(workTaskId), memberData)
      );

      let taskMemberData: TaskMember;

      // Handle response from axios
      if (response?.data) {
        // Axios response structure
        const responseData = response.data;
        if (
          responseData &&
          typeof responseData === "object" &&
          "data" in responseData
        ) {
          taskMemberData = (responseData as { data: TaskMember }).data;
        } else {
          taskMemberData = responseData as TaskMember;
        }
      } else {
        throw new Error("Invalid response format");
      }
      
      return taskMemberData;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to create task member"
      );
    }
  }
);

// Update task member
export const updateTaskMemberThunk = createAsyncThunk(
  "taskMembers/update",
  async (
    params: {
      workTaskId: string;
      memberId: string;
      memberData: UpdateTaskMemberRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      const { workTaskId, memberId, memberData } = params;

      const response = await callApiWithRetry(() =>
        axiosClient.put(
          ROUTES_API_TASK_MEMBERS.UPDATE(workTaskId, memberId),
          memberData
        )
      );

      let taskMemberData: TaskMember;

      // Handle response from axios
      if (response?.data) {
        // Axios response structure
        const responseData = response.data;
        if (
          responseData &&
          typeof responseData === "object" &&
          "data" in responseData
        ) {
          taskMemberData = (responseData as { data: TaskMember }).data;
        } else {
          taskMemberData = responseData as TaskMember;
        }
      } else {
        throw new Error("Invalid response format");
      }

      return taskMemberData;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update task member"
      );
    }
  }
);

// Delete task member (hard delete)
export const deleteTaskMemberThunk = createAsyncThunk(
  "taskMembers/delete",
  async (
    params: {
      workTaskId: string;
      memberId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { workTaskId, memberId } = params;

      await callApiWithRetry(() =>
        axiosClient.delete(ROUTES_API_TASK_MEMBERS.DELETE(workTaskId, memberId))
      );

      return { workTaskId, memberId };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete task member"
      );
    }
  }
);

// Remove task member (soft delete)
export const removeTaskMemberThunk = createAsyncThunk(
  "taskMembers/remove",
  async (
    params: {
      workTaskId: string;
      memberId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { workTaskId, memberId } = params;

      await callApiWithRetry(() =>
        axiosClient.put(ROUTES_API_TASK_MEMBERS.REMOVE(workTaskId, memberId))
      );

      return { workTaskId, memberId };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove task member"
      );
    }
  }
);
