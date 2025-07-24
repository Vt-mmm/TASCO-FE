import React from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
} from "@mui/icons-material";

interface TaskMemberHeaderProps {
  taskName?: string;
  isTaskOwner: boolean;
  isCurrentUserInTask: boolean;
  currentUser: { fullName?: string; email?: string; } | null;
  isCreating: boolean;
  onAddMember: () => void;
  onJoinTask: () => void;
}

const TaskMemberHeader: React.FC<TaskMemberHeaderProps> = ({
  taskName,
  isTaskOwner,
  isCurrentUserInTask,
  currentUser,
  isCreating,
  onAddMember,
  onJoinTask,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography variant="h6" component="h2">
        Quản lý thành viên task{taskName ? `: ${taskName}` : ""}
      </Typography>

      <Box sx={{ display: "flex", gap: 1 }}>
        {/* Chỉ OWNER mới được thêm thành viên */}
        {isTaskOwner && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddMember}
            disabled={isCreating}
          >
            Thêm thành viên
          </Button>
        )}

        {/* Nút tham gia task cho người chưa tham gia */}
        {!isCurrentUserInTask && currentUser && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onJoinTask}
            disabled={isCreating}
          >
            Tham gia task
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TaskMemberHeader;
