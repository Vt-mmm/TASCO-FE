import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_PROJECT_MEMBERS } from "../../constants/routesApiKeys";
import {
  UpdateMemberRoleRequest,
  UpdateMemberStatusRequest,
  ApplyProjectRequest,
} from "../../common/models/project";
import { ApiResponse } from "../../common/models/common";
import { AxiosError } from "axios";

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

// Delete member from project
export const deleteMemberThunk = createAsyncThunk(
  "projectMembers/deleteMember",
  async (
    { projectId, memberId }: { projectId: string; memberId: string },
    { rejectWithValue }
  ) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.delete(
          ROUTES_API_PROJECT_MEMBERS.DELETE_MEMBER(projectId, memberId)
        )
      );
      return { projectId, memberId };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove member"
      );
    }
  }
);

// Update member approved status
export const updateMemberStatusThunk = createAsyncThunk(
  "projectMembers/updateStatus",
  async (statusData: UpdateMemberStatusRequest, { rejectWithValue }) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.put<ApiResponse<unknown>>(
          ROUTES_API_PROJECT_MEMBERS.UPDATE_APPROVED_STATUS(
            statusData.projectId,
            statusData.memberId
          ),
          statusData
        )
      );
      return statusData;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update member status"
      );
    }
  }
);

// Update member role
export const updateMemberRoleThunk = createAsyncThunk(
  "projectMembers/updateRole",
  async (
    {
      projectId,
      memberId,
      roleData,
    }: {
      projectId: string;
      memberId: string;
      roleData: UpdateMemberRoleRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.put<ApiResponse<unknown>>(
          ROUTES_API_PROJECT_MEMBERS.UPDATE_ROLE(projectId, memberId),
          roleData
        )
      );
      return { projectId, memberId, role: roleData.role };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update member role"
      );
    }
  }
);

// Apply to project
export const applyToProjectThunk = createAsyncThunk(
  "projectMembers/applyToProject",
  async (
    {
      projectId,
      applicationData,
    }: {
      projectId: string;
      applicationData: ApplyProjectRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.put<ApiResponse<unknown>>(
          ROUTES_API_PROJECT_MEMBERS.APPLY_PROJECT(projectId),
          applicationData
        )
      );
      return { projectId, applicationData };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to apply to project"
      );
    }
  }
);
