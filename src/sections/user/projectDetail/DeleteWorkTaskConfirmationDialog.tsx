import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Task as TaskIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import type { WorkTask } from "../../../common/models/workArea";

interface DeleteWorkTaskConfirmationDialogProps {
  open: boolean;
  workTask: WorkTask | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

const DeleteWorkTaskConfirmationDialog: React.FC<
  DeleteWorkTaskConfirmationDialogProps
> = ({ open, workTask, onClose, onConfirm, isLoading }) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to delete work task:", error);
    }
  };

  const objectiveCount = workTask?.taskObjectives?.length || 0;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "todo":
      case "new":
        return "#2196F3";
      case "in_progress":
      case "in-progress":
        return "#FF9800";
      case "review":
        return "#9C27B0";
      case "done":
      case "completed":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "high":
        return "#FF5722";
      case "urgent":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(44, 44, 44, 0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "1.25rem",
          color: "#2C2C2C",
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <WarningIcon sx={{ color: "#F44336" }} />
        Delete Work Task
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2, color: "#2C2C2C" }}>
            Are you sure you want to delete this work task?
          </Typography>

          {workTask && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#FFF3E0",
                border: "1px solid #FFB74D",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#E65100" }}
                >
                  {workTask.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TaskIcon sx={{ fontSize: 16, color: "#FF9800" }} />
                  <Chip
                    label={`${objectiveCount} objectives`}
                    size="small"
                    sx={{
                      backgroundColor: "#FFE0B2",
                      color: "#E65100",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>
              </Box>

              {workTask.description && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, mb: 2, color: "#BF360C" }}
                >
                  {workTask.description}
                </Typography>
              )}

              {/* Task Details */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                {workTask.status && (
                  <Chip
                    label={workTask.status.replace("_", " ").toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(workTask.status),
                      color: "white",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                    }}
                  />
                )}
                {workTask.priority && (
                  <Chip
                    label={workTask.priority.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(workTask.priority),
                      color: "white",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                    }}
                  />
                )}
              </Box>

              {workTask.dueDate && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <CalendarIcon sx={{ fontSize: 16, color: "#FF9800" }} />
                  <Typography variant="body2" sx={{ color: "#BF360C" }}>
                    Due: {formatDate(workTask.dueDate)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Typography variant="body2" sx={{ color: "#666666", mb: 1 }}>
            ⚠️ This action cannot be undone. This will:
          </Typography>

          <Box component="ul" sx={{ pl: 2, color: "#666666" }}>
            <Typography component="li" variant="body2">
              Permanently delete the work task
            </Typography>
            <Typography component="li" variant="body2">
              Delete all {objectiveCount} task objective
              {objectiveCount !== 1 ? "s" : ""} and their sub-tasks
            </Typography>
            <Typography component="li" variant="body2">
              Remove all task comments and attachments
            </Typography>
            <Typography component="li" variant="body2">
              This cannot be recovered
            </Typography>
          </Box>

          {objectiveCount > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "#FFEBEE",
                border: "1px solid #EF9A9A",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#C62828", fontWeight: 600 }}
              >
                High Impact Warning:
              </Typography>
              <Typography variant="body2" sx={{ color: "#D32F2F", mt: 0.5 }}>
                This task contains {objectiveCount} objective
                {objectiveCount !== 1 ? "s" : ""} and their related sub-tasks.
                All objectives and sub-tasks will be permanently lost.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isLoading}
          sx={{
            borderRadius: 2,
            px: 3,
            backgroundColor: "#F44336",
            "&:hover": {
              backgroundColor: "#D32F2F",
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Deleting...
            </Box>
          ) : (
            "Delete Task"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteWorkTaskConfirmationDialog;
