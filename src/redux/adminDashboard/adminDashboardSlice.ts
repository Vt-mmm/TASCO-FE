import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminProject, PaginatedProjectResponse } from "../../common/models";
import { fetchProjectsThunk } from "./adminDashboardThunks";

interface AdminDashboardState {
  projects: AdminProject[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: AdminDashboardState = {
  projects: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  loading: false,
  error: null,
};

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProjectsThunk.fulfilled,
        (state, action: PayloadAction<PaginatedProjectResponse>) => {
          state.loading = false;
          state.projects = action.payload.projects;
          state.totalCount = action.payload.totalCount;
          state.pageNumber = action.payload.pageNumber;
          state.pageSize = action.payload.pageSize;
        }
      )
      .addCase(fetchProjectsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminDashboardSlice.reducer;
