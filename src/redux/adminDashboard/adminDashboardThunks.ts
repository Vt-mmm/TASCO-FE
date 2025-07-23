import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../axiosClient/axiosClient";
import { ROUTES_API_PROJECTS } from "../../constants/routesApiKeys";
import { PaginatedProjectResponse } from "../../common/models";

// Fetch paginated projects
export const fetchProjectsThunk = createAsyncThunk<
  PaginatedProjectResponse,
  { pageNumber: number; pageSize: number },
  { rejectValue: string }
>("admin/fetchProjects", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get(ROUTES_API_PROJECTS.GET_ALL, {
      params,
    });
    // Handle cases where the response might already be the data or nested in a data property
    const payload = response.data || response;
    return payload as PaginatedProjectResponse;
  } catch (err) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch projects"
    );
  }
});
