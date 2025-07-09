import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Divider,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/configStore";
import { TaskObjective, WorkTask } from "../../../common/models/workArea";
import {
  getTaskObjectivesByWorkTaskThunk,
  deleteTaskObjectiveThunk,
  completeTaskObjectiveThunk,
} from "../../../redux/taskObjectives/taskObjectivesThunks";
import ObjectiveCard from "./ObjectiveCard";

interface TaskObjectivesListProps {
  workTask: WorkTask;
  onCreateObjective?: () => void;
  onEditObjective?: (objective: TaskObjective) => void;
  showProgress?: boolean;
  maxHeight?: number;
}

const TaskObjectivesList: React.FC<TaskObjectivesListProps> = ({
  workTask,
  onCreateObjective,
  onEditObjective,
  showProgress = true,
  maxHeight = 400,
}) => {
  const dispatch = useAppDispatch();

  // Redux state
  const { objectivesByWorkTask, isLoadingByWorkTask, isCompleting, error } =
    useAppSelector((state) => state.taskObjectives);

  const objectives = objectivesByWorkTask[workTask.id] || [];
  const isLoading = isLoadingByWorkTask[workTask.id] || false;

  // Fetch objectives when component mounts or workTask changes
  useEffect(() => {
    if (workTask.id) {
      dispatch(getTaskObjectivesByWorkTaskThunk(workTask.id));
    }
  }, [dispatch, workTask.id]);

  // Calculate progress
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(
    (obj) => obj.isCompleted
  ).length;
  const progressPercentage =
    totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

  // Handlers
  const handleCreateObjective = () => {
    onCreateObjective?.();
  };

  const handleEditObjective = (objective: TaskObjective) => {
    onEditObjective?.(objective);
  };

  const handleDeleteObjective = async (objective: TaskObjective) => {
    if (
      window.confirm(`Are you sure you want to delete "${objective.title}"?`)
    ) {
      try {
        await dispatch(
          deleteTaskObjectiveThunk({
            workTaskId: workTask.id,
            objectiveId: objective.id,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to delete objective:", error);
      }
    }
  };

  const handleToggleComplete = async (
    objective: TaskObjective,
    isCompleted: boolean
  ) => {
    try {
      await dispatch(
        completeTaskObjectiveThunk({
          workTaskId: workTask.id,
          objectiveId: objective.id,
          isCompleted,
          objectiveData: objective,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to toggle objective completion:", error);
    }
  };

  // Loading skeleton
  const renderSkeleton = () => (
    <Box sx={{ space: 2 }}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ mb: 2 }}>
          <Skeleton
            variant="rectangular"
            height={80}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      ))}
    </Box>
  );

  // Empty state
  const renderEmptyState = () => (
    <Box
      sx={{
        textAlign: "center",
        py: 4,
        px: 2,
        backgroundColor: "#F8F9FA",
        borderRadius: 2,
        border: "1px dashed #E0E0E0",
      }}
    >
      <RadioButtonUncheckedIcon
        sx={{
          fontSize: 48,
          color: "#BDBDBD",
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: "#757575",
          mb: 1,
          fontWeight: 500,
        }}
      >
        No objectives yet
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#9E9E9E",
          mb: 3,
        }}
      >
        Break down this task into smaller, actionable objectives to track
        progress better.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreateObjective}
        sx={{
          backgroundColor: "#1976D2",
          color: "white",
          "&:hover": {
            backgroundColor: "#1565C0",
          },
        }}
      >
        Add First Objective
      </Button>
    </Box>
  );

  return (
    <Box>
      {/* Header with progress */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#2C2C2C",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircleIcon sx={{ color: "#4CAF50" }} />
            Task Objectives
            {totalObjectives > 0 && (
              <Chip
                label={`${completedObjectives}/${totalObjectives}`}
                size="small"
                sx={{
                  backgroundColor:
                    progressPercentage === 100 ? "#E8F5E8" : "#E3F2FD",
                  color: progressPercentage === 100 ? "#2E7D32" : "#1976D2",
                  fontWeight: 600,
                  ml: 1,
                }}
              />
            )}
          </Typography>

          {totalObjectives > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreateObjective}
              sx={{
                borderColor: "#1976D2",
                color: "#1976D2",
                "&:hover": {
                  backgroundColor: "#E3F2FD",
                  borderColor: "#1565C0",
                },
              }}
            >
              Add Objective
            </Button>
          )}
        </Box>

        {/* Progress bar */}
        {showProgress && totalObjectives > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "#666666" }}>
                Progress
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: progressPercentage === 100 ? "#4CAF50" : "#1976D2",
                  fontWeight: 600,
                }}
              >
                {Math.round(progressPercentage)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "#E0E0E0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    progressPercentage === 100 ? "#4CAF50" : "#1976D2",
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}

        <Divider />
      </Box>

      {/* Error state */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            // Clear error action would go here
          }}
        >
          {error}
        </Alert>
      )}

      {/* Content */}
      <Box
        sx={{
          maxHeight: maxHeight,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#F5F5F5",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#BDBDBD",
            borderRadius: 3,
            "&:hover": {
              backgroundColor: "#9E9E9E",
            },
          },
        }}
      >
        {isLoading ? (
          renderSkeleton()
        ) : totalObjectives === 0 ? (
          renderEmptyState()
        ) : (
          <Box sx={{ space: 2 }}>
            {objectives.map((objective) => (
              <Box key={objective.id} sx={{ mb: 2 }}>
                <ObjectiveCard
                  objective={objective}
                  onEdit={handleEditObjective}
                  onDelete={handleDeleteObjective}
                  onToggleComplete={handleToggleComplete}
                  isCompleting={isCompleting}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Loading overlay for actions */}
      {isCompleting && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            zIndex: 1,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default TaskObjectivesList;
