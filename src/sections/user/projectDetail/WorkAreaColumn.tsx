import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  Button,
  Chip,
  IconButton,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add,
  MoreVert,
  Assignment,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  WorkArea,
  WorkTask,
  CreateWorkTaskRequest,
  TaskObjective,
} from "../../../common/models/workArea";
import { useAppDispatch, useAppSelector } from "../../../redux/configStore";
import { createWorkTaskThunk } from "../../../redux/workTasks/workTasksThunks";
import { CreateTaskDialog } from "./CreateTaskDialog";
import TaskCard from "./TaskCard";

interface Props {
  workArea: WorkArea;
  onTaskCreated?: () => void; // Callback to refresh work areas after task creation
  onEditWorkArea: (workArea: WorkArea) => void;
  onDeleteWorkArea: (workArea: WorkArea) => void;
  onEditWorkTask?: (workTask: WorkTask) => void;
  onDeleteWorkTask?: (workTask: WorkTask) => void;
  onCreateObjective?: (workTask: WorkTask) => void;
  onEditObjective?: (objective: TaskObjective) => void;
  onViewTaskDetails?: (workTask: WorkTask) => void;
  onManageTaskMembers?: (workTask: WorkTask) => void; // New prop for managing task members
}

const WorkAreaColumn: React.FC<Props> = ({
  workArea,
  onTaskCreated,
  onEditWorkArea,
  onDeleteWorkArea,
  onEditWorkTask,
  onDeleteWorkTask,
  onCreateObjective,
  onEditObjective,
  onViewTaskDetails,
  onManageTaskMembers,
}) => {
  const dispatch = useAppDispatch();
  const { isCreating } = useAppSelector((state) => state.workTasks);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Use work tasks from props (work areas already include work tasks from backend)
  const workTasks = workArea.workTasks || [];

  const handleCreateTask = async (taskData: CreateWorkTaskRequest) => {
    try {
      const resultAction = await dispatch(
        createWorkTaskThunk({
          workAreaId: workArea.id,
          workTaskData: taskData,
        })
      );

      if (createWorkTaskThunk.fulfilled.match(resultAction)) {
        // Task created successfully
        setIsCreateDialogOpen(false);

        // Refresh work areas to get updated work tasks
        onTaskCreated?.();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEditWorkArea(workArea);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteWorkArea(workArea);
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        minWidth: 320,
        maxWidth: 320,
        flexShrink: 0,
      }}
    >
      {/* Column Header */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(44, 44, 44, 0.08)",
          border: "1px solid rgba(44, 44, 44, 0.1)",
          mb: 2,
        }}
      >
        <CardHeader
          title={
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#2C2C2C",
                fontSize: "1.1rem",
              }}
            >
              {workArea.name}
            </Typography>
          }
          subheader={
            workArea.description && (
              <Typography variant="body2" color="#666666" sx={{ mt: 0.5 }}>
                {workArea.description}
              </Typography>
            )
          }
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${workTasks.length} tasks`}
                size="small"
                sx={{
                  backgroundColor: "rgba(44, 44, 44, 0.1)",
                  color: "#2C2C2C",
                  fontWeight: 500,
                }}
              />
              <>
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      mt: 1,
                      boxShadow: "0 4px 16px rgba(44, 44, 44, 0.12)",
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit Work Area</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleDelete} sx={{ color: "#F44336" }}>
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" sx={{ color: "#F44336" }} />
                    </ListItemIcon>
                    <ListItemText>Delete Work Area</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            </Box>
          }
          sx={{
            pb: 1,
            "& .MuiCardHeader-action": {
              alignSelf: "flex-start",
              mt: 0.5,
            },
          }}
        />
      </Card>

      {/* Tasks Column */}
      <Box
        sx={{
          borderRadius: 3,
          p: 2,
          minHeight: 400,
          maxHeight: 600,
          overflowY: "auto",
          border: "2px solid rgba(44, 44, 44, 0.1)",
          backgroundColor: "#f9f9f9",
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: 3,
          },
        }}
      >
        {workTasks.length > 0 ? (
          <Stack spacing={2}>
            {workTasks.map((task: WorkTask) => (
              <TaskCard
                key={task.id}
                task={task}
                onEditTask={onEditWorkTask}
                onDeleteTask={onDeleteWorkTask}
                onCreateObjective={onCreateObjective}
                onEditObjective={onEditObjective}
                onViewDetails={onViewTaskDetails}
                onManageMembers={onManageTaskMembers}
              />
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              color: "#999999",
            }}
          >
            <Assignment sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2" textAlign="center">
              No tasks in this work area
            </Typography>
            <Typography variant="caption" textAlign="center" sx={{ mt: 1 }}>
              Tasks will appear here when added
            </Typography>
          </Box>
        )}

        {/* Add Task Button */}
        <Button
          fullWidth
          startIcon={<Add />}
          variant="text"
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={isCreating}
          sx={{
            mt: 2,
            py: 1.5,
            borderRadius: 2,
            border: "2px dashed rgba(44, 44, 44, 0.2)",
            color: "#666666",
            "&:hover": {
              backgroundColor: "rgba(44, 44, 44, 0.04)",
              borderColor: "rgba(44, 44, 44, 0.3)",
            },
          }}
        >
          Add Task
        </Button>
      </Box>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
      />
    </Box>
  );
};

export default WorkAreaColumn;
