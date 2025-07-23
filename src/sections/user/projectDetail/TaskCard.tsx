import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Tooltip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Person,
  CalendarToday,
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
  Visibility,
} from "@mui/icons-material";
import { WorkTask, TaskObjective } from "../../../common/models/workArea";

interface Props {
  task: WorkTask;
  onEditTask?: (task: WorkTask) => void;
  onDeleteTask?: (task: WorkTask) => void;
  onCreateObjective?: (task: WorkTask) => void;
  onEditObjective?: (objective: TaskObjective) => void;
  onViewDetails?: (task: WorkTask) => void;
}

function getStatusColor(
  status: string
): "default" | "success" | "info" | "warning" | "error" {
  switch (status?.toLowerCase()) {
    case "active":
    case "todo":
      return "default";
    case "in_progress":
      return "warning";
    case "review":
      return "info";
    case "completed":
    case "done":
      return "success";
    case "archived":
      return "error";
    default:
      return "default";
  }
}

function getPriorityColor(priority?: string) {
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
}

const TaskCard: React.FC<Props> = ({
  task,
  onEditTask,
  onDeleteTask,
  onViewDetails,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onEditTask) {
      onEditTask(task);
    }
    handleMenuClose();
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDeleteTask) {
      onDeleteTask(task);
    }
    handleMenuClose();
  };

  const handleCardClick = (event: React.MouseEvent) => {
    // Only trigger if not clicking on interactive elements
    const target = event.target as HTMLElement;
    const isInteractiveElement = target.closest(
      'button, [role="button"], input, a'
    );

    if (!isInteractiveElement && onViewDetails) {
      event.stopPropagation();
      onViewDetails(task);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        borderRadius: 2,
        boxShadow: "0 1px 4px rgba(44, 44, 44, 0.08)",
        border: "1px solid rgba(44, 44, 44, 0.1)",
        cursor: onViewDetails ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(44, 44, 44, 0.12)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Task Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "#2C2C2C",
                flex: 1,
                lineHeight: 1.3,
                pr: 1,
              }}
            >
              {task.name}
            </Typography>
            {onViewDetails && (
              <Visibility
                sx={{
                  fontSize: 14,
                  color: "#9E9E9E",
                  opacity: 0.7,
                  transition: "opacity 0.2s ease",
                  "&:hover": {
                    opacity: 1,
                    color: "#1976D2",
                  },
                }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Chip
              label={task.status.replace("_", " ")}
              size="small"
              color={getStatusColor(task.status)}
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            />

            {(onEditTask || onDeleteTask) && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  width: 20,
                  height: 20,
                  color: "#666666",
                  "&:hover": {
                    backgroundColor: "rgba(44, 44, 44, 0.08)",
                  },
                }}
              >
                <MoreVert sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Task Description */}
        {task.description && (
          <Typography
            variant="body2"
            color="#666666"
            sx={{
              mb: 2,
              fontSize: "0.8rem",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Task Meta */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {task.priority && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: getPriorityColor(task.priority),
                }}
              />
            )}
            {task.dueDate && (
              <Tooltip title="Due date">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CalendarToday sx={{ fontSize: 12, color: "#666666" }} />
                  <Typography variant="caption" color="#666666">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            {task.taskObjectives && task.taskObjectives.length > 0 && (
              <Tooltip title="Task objectives">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CheckCircle
                    sx={{
                      fontSize: 12,
                      color:
                        task.completedObjectivesCount === task.objectivesCount
                          ? "#4CAF50"
                          : "#9E9E9E",
                    }}
                  />
                  <Typography variant="caption" color="#666666">
                    {task.completedObjectivesCount || 0}/
                    {task.objectivesCount || task.taskObjectives.length}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>

          {task.assignedToId && (
            <Tooltip title="Assigned user">
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: "#2C2C2C",
                  fontSize: "0.7rem",
                }}
              >
                <Person sx={{ fontSize: 14 }} />
              </Avatar>
            </Tooltip>
          )}
        </Box>
      </CardContent>

      {/* Task Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 16px rgba(44, 44, 44, 0.1)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {onEditTask && (
          <MenuItem onClick={handleEditClick} sx={{ gap: 1 }}>
            <Edit sx={{ fontSize: 16 }} />
            Edit Task
          </MenuItem>
        )}
        {onDeleteTask && (
          <MenuItem
            onClick={handleDeleteClick}
            sx={{ gap: 1, color: "error.main" }}
          >
            <Delete sx={{ fontSize: 16 }} />
            Delete Task
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default TaskCard;
