import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { TaskMember } from "../../../common/models/taskMember";

interface TaskMemberDeleteDialogProps {
  open: boolean;
  member: TaskMember | null;
  isCurrentUser: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const TaskMemberDeleteDialog: React.FC<TaskMemberDeleteDialogProps> = ({
  open,
  member,
  isCurrentUser,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!member) return null;

  const getDialogTitle = () => {
    if (isCurrentUser) {
      return "Rời khỏi task";
    }
    return "Xóa thành viên";
  };

  const getDialogContent = () => {
    if (isCurrentUser) {
      // Check if current user is trying to remove themselves as OWNER
      if (member.role === "OWNER") {
        return {
          title: "Không thể rời khỏi task",
          description:
            "Bạn là chủ sở hữu của task này và không thể tự rời khỏi.",
          warning:
            "Hãy chuyển quyền chủ sở hữu cho thành viên khác trước khi rời khỏi.",
          buttonText: "Đã hiểu",
          icon: <WarningIcon sx={{ fontSize: 40, color: "warning.main" }} />,
          color: "warning" as const,
          isBlocked: true,
        };
      }
      return {
        title: "Bạn có chắc chắn muốn rời khỏi task này?",
        description:
          "Sau khi rời khỏi, bạn sẽ không còn là thành viên của task này. Bạn có thể tự tham gia lại hoặc được thêm lại bởi quản trị viên.",
        warning: "Bạn sẽ mất quyền truy cập vào task cho đến khi tham gia lại.",
        buttonText: "Rời khỏi",
        icon: <PersonIcon sx={{ fontSize: 40, color: "warning.main" }} />,
        color: "warning" as const,
        isBlocked: false,
      };
    }

    // Task owner trying to remove another OWNER
    if (member.role === "OWNER") {
      return {
        title: "Không thể xóa chủ sở hữu task",
        description: `Thành viên "${member.userName}" là chủ sở hữu của task này và không thể bị xóa.`,
        warning: "Hãy thay đổi vai trò của thành viên này trước khi xóa.",
        buttonText: "Đã hiểu",
        icon: <WarningIcon sx={{ fontSize: 40, color: "warning.main" }} />,
        color: "warning" as const,
        isBlocked: true,
      };
    }

    return {
      title: "Bạn có chắc chắn muốn xóa thành viên này?",
      description: `Thành viên "${member.userName}" sẽ bị xóa khỏi task và mất quyền truy cập hiện tại.`,
      warning: "Thành viên có thể tự tham gia lại hoặc được thêm lại sau này.",
      buttonText: "Xóa khỏi task",
      icon: <DeleteIcon sx={{ fontSize: 40, color: "error.main" }} />,
      color: "error" as const,
      isBlocked: false,
    };
  };

  const content = getDialogContent();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {content.icon}
          <Typography variant="h6" fontWeight="bold">
            {getDialogTitle()}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", px: 3 }}>
        {/* Member Info */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          mb={3}
        >
          <Avatar sx={{ bgcolor: content.color + ".main" }}>
            {member.userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box textAlign="left">
            <Typography variant="subtitle1" fontWeight="bold">
              {member.userName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {member.userEmail}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Vai trò:{" "}
              {member.role === "OWNER"
                ? "Chủ sở hữu"
                : member.role === "ASSIGNEE"
                ? "Người thực hiện"
                : member.role === "REVIEWER"
                ? "Người đánh giá"
                : "Thành viên"}
            </Typography>
          </Box>
        </Box>

        {/* Main Message */}
        <Typography variant="body1" mb={2} fontWeight="500">
          {content.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          {content.description}
        </Typography>

        {/* Warning Alert */}
        <Alert severity={content.color} icon={<WarningIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="500">
            {content.warning}
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          disabled={isDeleting}
          sx={{ minWidth: 120 }}
        >
          {content.isBlocked ? "Đóng" : "Hủy bỏ"}
        </Button>
        {!content.isBlocked && (
          <Button
            onClick={onConfirm}
            variant="contained"
            color={content.color}
            size="large"
            disabled={isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : content.color === "error" ? (
                <DeleteIcon />
              ) : (
                <PersonIcon />
              )
            }
            sx={{ minWidth: 120 }}
          >
            {isDeleting ? "Đang xử lý..." : content.buttonText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TaskMemberDeleteDialog;
