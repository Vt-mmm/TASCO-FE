import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Add, Info } from "@mui/icons-material";
import {
  WorkArea,
  WorkTask,
  TaskObjective,
} from "../../../common/models/workArea";
import WorkAreaColumn from "./WorkAreaColumn";

interface Props {
  workAreas: WorkArea[];
  onOpenDialog: () => void;
  isCreating: boolean;
  onTaskCreated?: () => void; // Callback to refresh work areas after task creation
  onEditWorkArea: (workArea: WorkArea) => void;
  onDeleteWorkArea: (workArea: WorkArea) => void;
  onEditWorkTask?: (workTask: WorkTask) => void;
  onDeleteWorkTask?: (workTask: WorkTask) => void;
  onCreateObjective?: (workTask: WorkTask) => void;
  onEditObjective?: (objective: TaskObjective) => void;
  onViewTaskDetails?: (workTask: WorkTask) => void;
}

const WorkAreasBoard: React.FC<Props> = ({
  workAreas,
  onOpenDialog,
  isCreating,
  onTaskCreated,
  onEditWorkArea,
  onDeleteWorkArea,
  onEditWorkTask,
  onDeleteWorkTask,
  onCreateObjective,
  onEditObjective,
  onViewTaskDetails,
}) => {
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "white",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(44, 44, 44, 0.08)",
        border: "1px solid rgba(44, 44, 44, 0.1)",
      }}
    >
      {/* Board Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
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
          <Info sx={{ fontSize: 20 }} />
          Work Areas Board
        </Typography>
      </Box>

      {/* Board Columns */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          pb: 2,
          minHeight: "500px",
          "&::-webkit-scrollbar": {
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: 4,
            "&:hover": {
              backgroundColor: "#a8a8a8",
            },
          },
        }}
      >
        {workAreas.map((workArea) => (
          <WorkAreaColumn
            key={workArea.id}
            workArea={workArea}
            onTaskCreated={onTaskCreated}
            onEditWorkArea={onEditWorkArea}
            onDeleteWorkArea={onDeleteWorkArea}
            onEditWorkTask={onEditWorkTask}
            onDeleteWorkTask={onDeleteWorkTask}
            onCreateObjective={onCreateObjective}
            onEditObjective={onEditObjective}
            onViewTaskDetails={onViewTaskDetails}
          />
        ))}

        {/* Add New Work Area Column */}
        <Box
          sx={{
            minWidth: 320,
            maxWidth: 320,
            flexShrink: 0,
          }}
        >
          <Button
            fullWidth
            startIcon={<Add />}
            variant="outlined"
            onClick={onOpenDialog}
            disabled={isCreating}
            sx={{
              height: 80,
              borderRadius: 3,
              borderColor: "rgba(44, 44, 44, 0.2)",
              color: "#666666",
              borderStyle: "dashed",
              borderWidth: 2,
              "&:hover": {
                backgroundColor: "rgba(44, 44, 44, 0.04)",
                borderColor: "rgba(44, 44, 44, 0.4)",
              },
            }}
          >
            {isCreating ? "Creating..." : "Add Work Area"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkAreasBoard;
