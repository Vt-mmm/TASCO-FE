import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  Button,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CalendarToday,
  Person,
  Flag as FlagIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { WorkTask, TaskObjective } from "../../../common/models/workArea";
import TaskObjectivesList from "./TaskObjectivesList";
import CommentsList from "./CommentsList";

interface TaskDetailDialogProps {
  open: boolean;
  task: WorkTask | null;
  onClose: () => void;
  onEditTask?: (task: WorkTask) => void;
  onCreateObjective?: (task: WorkTask) => void;
  onEditObjective?: (objective: TaskObjective) => void;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  open,
  task,
  onClose,
  onEditTask,
  onCreateObjective,
  onEditObjective,
}) => {
  if (!task) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "todo":
        return { bg: "#E3F2FD", color: "#1976D2" };
      case "in_progress":
        return { bg: "#FFF3E0", color: "#F57C00" };
      case "review":
        return { bg: "#F3E5F5", color: "#7B1FA2" };
      case "done":
        return { bg: "#E8F5E8", color: "#2E7D32" };
      default:
        return { bg: "#F5F5F5", color: "#666666" };
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "urgent":
        return "#FF5722";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const statusStyle = getStatusColor(task.status);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          borderBottom: "1px solid #E0E0E0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <AssignmentIcon sx={{ color: "#1976D2", fontSize: 28 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#2C2C2C",
                wordBreak: "break-word",
                mb: 0.5,
              }}
            >
              {task.name}
            </Typography>
            <Chip
              label={task.status.replace("_", " ")}
              size="small"
              sx={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onEditTask && (
            <Tooltip title="Edit Task">
              <IconButton
                onClick={() => onEditTask(task)}
                size="small"
                sx={{
                  color: "#666666",
                  "&:hover": { backgroundColor: "#F5F5F5" },
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#666666",
              "&:hover": { backgroundColor: "#F5F5F5" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Task Description */}
          {task.description && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#2C2C2C", mb: 1 }}
              >
                Description
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#666666",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {task.description}
              </Typography>
            </Box>
          )}

          {/* Task Meta Information */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "#2C2C2C", mb: 2 }}
            >
              Task Information
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {/* Priority */}
              {task.priority && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FlagIcon
                    sx={{
                      fontSize: 16,
                      color: getPriorityColor(task.priority),
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "#666666" }}>
                    Priority: {task.priority}
                  </Typography>
                </Box>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 16, color: "#666666" }} />
                  <Typography variant="body2" sx={{ color: "#666666" }}>
                    Due: {formatDate(task.dueDate)}
                  </Typography>
                </Box>
              )}

              {/* Assigned User */}
              {task.assignedToId && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person sx={{ fontSize: 16, color: "#666666" }} />
                  <Typography variant="body2" sx={{ color: "#666666" }}>
                    Assigned to: {task.assignedToId}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Task Objectives Section */}
          <Box sx={{ mb: 3 }}>
            <TaskObjectivesList
              workTask={task}
              onCreateObjective={() => onCreateObjective?.(task)}
              onEditObjective={onEditObjective}
              showProgress={true}
              maxHeight={300}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Comments Section */}
          <Box>
            <CommentsList taskId={task.id} taskName={task.name} />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
