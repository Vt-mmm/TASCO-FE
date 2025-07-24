import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { CreateTaskMemberRequest } from "../../../common/models/taskMember";
import UserSelectorDropdown from "./UserSelectorDropdown";
import { useProjectMembers } from "./useProjectMembers";

interface TaskMemberDialogsProps {
  // Add Dialog
  openAddDialog: boolean;
  onCloseAddDialog: () => void;
  onAddMember: () => void;
  isCreating: boolean;

  // Edit Dialog
  openEditDialog: boolean;
  onCloseEditDialog: () => void;
  onEditMember: () => void;
  isUpdating: boolean;

  // Form Data
  formData: CreateTaskMemberRequest;
  onFormDataChange: (data: CreateTaskMemberRequest) => void;

  // Permissions
  isTaskOwner: boolean;

  // Project ID to fetch members
  projectId: string;

  // Exclude already added members
  excludeUserIds?: string[];
}

const TaskMemberDialogs: React.FC<TaskMemberDialogsProps> = ({
  openAddDialog,
  onCloseAddDialog,
  onAddMember,
  isCreating,
  openEditDialog,
  onCloseEditDialog,
  onEditMember,
  isUpdating,
  formData,
  onFormDataChange,
  isTaskOwner,
  projectId,
  excludeUserIds = [],
}) => {
  // Get project members for dropdown
  const {
    users,
    isLoading: loadingUsers,
    error: usersError,
  } = useProjectMembers(projectId);

  const handleFormChange = (
    field: keyof CreateTaskMemberRequest,
    value: string
  ) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleUserSelect = (
    userId: string,
    userEmail: string,
    userName?: string
  ) => {
    // Tìm project member để lấy đủ thông tin
    const projectMember = users.find((user) => user.userId === userId);
    const actualEmail = projectMember?.email || userEmail;
    const actualUserName = projectMember?.userName || userName || "";

    const newFormData = {
      ...formData,
      userId,
      userEmail: actualEmail,
      userName: actualUserName,
    };

    onFormDataChange(newFormData);
  };

  return (
    <>
      {/* Add Member Dialog - Chỉ hiển thị cho OWNER */}
      {isTaskOwner && (
        <Dialog open={openAddDialog} onClose={onCloseAddDialog}>
          <DialogTitle>Thêm thành viên mới</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <UserSelectorDropdown
                value={formData.userId}
                onChange={handleUserSelect}
                users={users}
                isLoading={loadingUsers}
                error={usersError}
                label="Chọn thành viên *"
                placeholder="Tìm kiếm thành viên..."
                excludeUserIds={excludeUserIds}
              />
              <TextField
                label="Tên thành viên *"
                value={formData.userName}
                onChange={(e) => handleFormChange("userName", e.target.value)}
                fullWidth
                disabled
                helperText="Tên sẽ được tự động điền khi chọn thành viên"
              />
              <TextField
                label="Email"
                value={formData.userEmail}
                onChange={(e) => handleFormChange("userEmail", e.target.value)}
                fullWidth
                disabled
                helperText="Email sẽ được tự động điền khi chọn thành viên"
              />
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleFormChange("role", e.target.value)}
                >
                  <MenuItem value="MEMBER">Thành viên</MenuItem>
                  <MenuItem value="ASSIGNEE">Người thực hiện</MenuItem>
                  <MenuItem value="REVIEWER">Người đánh giá</MenuItem>
                  <MenuItem value="OWNER">Chủ sở hữu</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseAddDialog}>Hủy</Button>
            <Button
              onClick={onAddMember}
              variant="contained"
              disabled={isCreating}
            >
              {isCreating ? <CircularProgress size={20} /> : "Thêm"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Edit Member Dialog - Chỉ hiển thị cho OWNER */}
      {isTaskOwner && (
        <Dialog open={openEditDialog} onClose={onCloseEditDialog}>
          <DialogTitle>Chỉnh sửa thành viên</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label="User ID *"
                value={formData.userId}
                onChange={(e) => handleFormChange("userId", e.target.value)}
                fullWidth
                disabled
                helperText="User ID không thể thay đổi"
              />
              <TextField
                label="Tên thành viên *"
                value={formData.userName}
                onChange={(e) => handleFormChange("userName", e.target.value)}
                fullWidth
                disabled
                helperText="Tên thành viên không thể thay đổi"
              />
              <TextField
                label="Email"
                value={formData.userEmail}
                onChange={(e) => handleFormChange("userEmail", e.target.value)}
                fullWidth
                disabled
                helperText="Email không thể thay đổi"
              />
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleFormChange("role", e.target.value)}
                >
                  <MenuItem value="MEMBER">Thành viên</MenuItem>
                  <MenuItem value="ASSIGNEE">Người thực hiện</MenuItem>
                  <MenuItem value="REVIEWER">Người đánh giá</MenuItem>
                  <MenuItem value="OWNER">Chủ sở hữu</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseEditDialog}>Hủy</Button>
            <Button
              onClick={onEditMember}
              variant="contained"
              disabled={isUpdating}
            >
              {isUpdating ? <CircularProgress size={20} /> : "Cập nhật"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default TaskMemberDialogs;
