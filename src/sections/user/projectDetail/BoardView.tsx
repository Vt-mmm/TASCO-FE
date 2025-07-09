import React, { useState } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { Assignment } from "@mui/icons-material";
import {
  WorkArea,
  CreateWorkAreaRequest,
  WorkTask,
  TaskObjective,
} from "../../../common/models/workArea";
import { Project, ProjectRequest } from "../../../common/models/project";

import CreateWorkAreaDialog from "./CreateWorkAreaDialog";
import ProjectHeader from "./ProjectHeader";
import WorkAreasBoard from "./WorkAreasBoard";
import JoinRequestDialog from "./JoinRequestDialog";

interface Props {
  project: Project;
  workAreas: WorkArea[];
  projectRequests?: ProjectRequest[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreateWorkArea: (workAreaData: CreateWorkAreaRequest) => Promise<void>;
  onApproveRequest?: (requestId: string) => Promise<void>;
  onRejectRequest?: (requestId: string, reason?: string) => Promise<void>;
  isCreating?: boolean;
  onRefreshWorkAreas?: () => void; // Callback to refresh work areas after task creation
  onEditWorkArea?: (workArea: WorkArea) => void;
  onDeleteWorkArea?: (workArea: WorkArea) => void;
  onEditWorkTask?: (workTask: WorkTask) => void;
  onDeleteWorkTask?: (workTask: WorkTask) => void;
  onCreateObjective?: (workTask: WorkTask) => void;
  onEditObjective?: (objective: TaskObjective) => void;
  onViewTaskDetails?: (workTask: WorkTask) => void;
  onManageMembers?: () => void;
}

const BoardView: React.FC<Props> = ({
  project,
  workAreas,
  projectRequests = [],
  isLoading,
  error,
  onRetry,
  onCreateWorkArea,
  onApproveRequest,
  onRejectRequest,
  isCreating = false,
  onRefreshWorkAreas,
  onEditWorkArea,
  onDeleteWorkArea,
  onEditWorkTask,
  onDeleteWorkTask,
  onCreateObjective,
  onEditObjective,
  onViewTaskDetails,
  onManageMembers,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCreateWorkArea = async (workAreaData: CreateWorkAreaRequest) => {
    await onCreateWorkArea(workAreaData);
    setDialogOpen(false);
  };

  const handleRequestDialogOpen = () => {
    setRequestDialogOpen(true);
  };

  const handleRequestDialogClose = () => {
    setRequestDialogOpen(false);
  };

  const handleApproveRequest = async (requestId: string) => {
    if (onApproveRequest) {
      await onApproveRequest(requestId);
    }
  };

  const handleRejectRequest = async (requestId: string, reason?: string) => {
    if (onRejectRequest) {
      await onRejectRequest(requestId, reason);
    }
  };

  // Calculate stats
  const totalTasks = workAreas.reduce(
    (sum, area) => sum + (area.workTasks?.length || 0),
    0
  );
  const completedTasks = workAreas.reduce(
    (sum, area) =>
      sum +
      (area.workTasks?.filter((task) => task.status === "done").length || 0),
    0
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#FAFAFA",
          borderRadius: 3,
        }}
      >
        <Box textAlign="center">
          <Assignment sx={{ fontSize: 48, color: "#49467E", mb: 2 }} />
          <Typography variant="h6" color="#666666">
            Loading project board...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#FAFAFA",
          borderRadius: 3,
          p: 4,
        }}
      >
        <Assignment sx={{ fontSize: 48, color: "#FF5722", mb: 2 }} />
        <Typography variant="h6" color="error" mb={2}>
          Failed to load project board
        </Typography>
        <Typography variant="body2" color="#666666" mb={3} textAlign="center">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{
            backgroundColor: "#49467E",
            color: "white",
            "&:hover": {
              backgroundColor: "#3e3a69",
            },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      {/* Main Board Container */}
      <Paper
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(73, 70, 126, 0.1)",
          border: "1px solid rgba(73, 70, 126, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Project Header */}
        <ProjectHeader
          project={project}
          workAreas={workAreas}
          projectRequests={projectRequests}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          onOpenDialog={handleOpenDialog}
          onRequestDialogOpen={handleRequestDialogOpen}
          onManageMembers={onManageMembers}
        />

        {/* Work Areas Board */}
        <WorkAreasBoard
          workAreas={workAreas}
          onOpenDialog={handleOpenDialog}
          isCreating={isCreating}
          onTaskCreated={onRefreshWorkAreas}
          onEditWorkArea={onEditWorkArea || (() => {})}
          onDeleteWorkArea={onDeleteWorkArea || (() => {})}
          onEditWorkTask={onEditWorkTask}
          onDeleteWorkTask={onDeleteWorkTask}
          onCreateObjective={onCreateObjective}
          onEditObjective={onEditObjective}
          onViewTaskDetails={onViewTaskDetails}
        />
      </Paper>

      {/* Create Work Area Dialog */}
      <CreateWorkAreaDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onCreateWorkArea={handleCreateWorkArea}
        isCreating={isCreating}
      />

      {/* Join Request Dialog */}
      <JoinRequestDialog
        open={requestDialogOpen}
        projectRequests={projectRequests}
        onClose={handleRequestDialogClose}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectRequest}
      />
    </>
  );
};

export default BoardView;
