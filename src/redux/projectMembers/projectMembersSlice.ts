import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  deleteMemberThunk,
  updateMemberStatusThunk,
  updateMemberRoleThunk,
  applyToProjectThunk,
} from "./projectMembersThunks";

export interface ProjectMembersState {
  isLoading: boolean;
  isUpdating: boolean;
  isApplying: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ProjectMembersState = {
  isLoading: false,
  isUpdating: false,
  isApplying: false,
  error: null,
  successMessage: null,
};

const projectMembersSlice = createSlice({
  name: "projectMembers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Delete member
      .addCase(deleteMemberThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMemberThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = "Member removed successfully";
        toast.success(state.successMessage);
      })
      .addCase(deleteMemberThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Update member status
      .addCase(updateMemberStatusThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMemberStatusThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const approvedStatus = action.payload.approvedStatus;
        state.successMessage = `Member ${
          approvedStatus === "approved" ? "approved" : "rejected"
        } successfully`;
        toast.success(state.successMessage);
      })
      .addCase(updateMemberStatusThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Update member role
      .addCase(updateMemberRoleThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMemberRoleThunk.fulfilled, (state) => {
        state.isUpdating = false;
        state.successMessage = "Member role updated successfully";
        toast.success(state.successMessage);
      })
      .addCase(updateMemberRoleThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })

      // Apply to project
      .addCase(applyToProjectThunk.pending, (state) => {
        state.isApplying = true;
        state.error = null;
      })
      .addCase(applyToProjectThunk.fulfilled, (state) => {
        state.isApplying = false;
        state.successMessage = "Application submitted successfully";
        toast.success(state.successMessage);
      })
      .addCase(applyToProjectThunk.rejected, (state, action) => {
        state.isApplying = false;
        state.error = action.payload as string;
        toast.error(state.error);
      });
  },
});

export const { clearError, clearSuccess } = projectMembersSlice.actions;
export default projectMembersSlice.reducer;
