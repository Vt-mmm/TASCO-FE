import React, { useState } from "react";
import {
  WorkArea,
  WorkTask,
  CreateWorkAreaRequest,
} from "../../../common/models/workArea";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import CreateWorkAreaDialog from "./CreateWorkAreaDialog";

interface Props {
  projectId: string;
  workAreas: WorkArea[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreateWorkArea: (workAreaData: CreateWorkAreaRequest) => Promise<void>;
  isCreating?: boolean;
}

function getStatusColor(
  status: string
): "default" | "success" | "info" | "warning" | "error" {
  switch (status) {
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

const WorkAreasSection: React.FC<Props> = ({
  projectId, // eslint-disable-line @typescript-eslint/no-unused-vars
  workAreas,
  isLoading,
  error,
  onRetry,
  onCreateWorkArea,
  isCreating = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

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
  // Loading state
  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(44, 44, 44, 0.08)",
          border: "1px solid rgba(44, 44, 44, 0.1)",
          mb: 4,
        }}
      >
        <CardHeader title="Work Areas" subheader="Loading work areas..." />
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
            <CircularProgress size={40} sx={{ color: "#2C2C2C" }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(44, 44, 44, 0.08)",
          border: "1px solid rgba(44, 44, 44, 0.1)",
          mb: 4,
        }}
      >
        <CardHeader title="Work Areas" subheader="Failed to load work areas" />
        <CardContent>
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={onRetry}
                sx={{ fontWeight: 600 }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!workAreas.length) {
    return (
      <>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(44, 44, 44, 0.08)",
            border: "1px solid rgba(44, 44, 44, 0.1)",
            mb: 4,
          }}
        >
          <CardHeader
            title="Work Areas"
            subheader="No work areas found for this project"
            action={
              <Button
                startIcon={<Add />}
                variant="contained"
                onClick={handleOpenDialog}
                sx={{
                  backgroundColor: "#2C2C2C",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1a1a1a",
                  },
                }}
              >
                Add Work Area
              </Button>
            }
          />
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 2 }}
            >
              Create your first work area to organize project tasks.
            </Typography>
          </CardContent>
        </Card>

        <CreateWorkAreaDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onCreateWorkArea={handleCreateWorkArea}
          isCreating={isCreating}
        />
      </>
    );
  }

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(44, 44, 44, 0.08)",
          border: "1px solid rgba(44, 44, 44, 0.1)",
          mb: 4,
        }}
      >
        <CardHeader
          title="Work Areas"
          subheader={`${workAreas.length} work area${
            workAreas.length !== 1 ? "s" : ""
          } found`}
          action={
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: "#2C2C2C",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1a1a1a",
                },
              }}
            >
              Add Work Area
            </Button>
          }
        />
        <CardContent>
          <Stack spacing={3}>
            {workAreas.map((wa) => (
              <Card
                key={wa.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 1px 4px rgba(44, 44, 44, 0.06)",
                  border: "1px solid rgba(44, 44, 44, 0.08)",
                }}
              >
                <CardHeader
                  title={wa.name}
                  subheader={wa.description}
                  action={
                    <Chip
                      label={wa.status}
                      color={getStatusColor(wa.status)}
                      size="small"
                    />
                  }
                />
                <CardContent>
                  {wa.workTasks && wa.workTasks.length > 0 ? (
                    <List>
                      {wa.workTasks.map((task: WorkTask) => (
                        <ListItem key={task.id} divider>
                          <ListItemText
                            primary={task.name}
                            secondary={task.description || "No description"}
                          />
                          <Chip
                            label={task.status}
                            color={getStatusColor(task.status)}
                            size="small"
                            sx={{ textTransform: "capitalize" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No tasks in this work area.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <CreateWorkAreaDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onCreateWorkArea={handleCreateWorkArea}
        isCreating={isCreating}
      />
    </>
  );
};

export default WorkAreasSection;
