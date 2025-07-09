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
  Assignment as TaskIcon,
} from "@mui/icons-material";
import type { WorkArea } from "../../../common/models/workArea";

interface DeleteWorkAreaConfirmationDialogProps {
  open: boolean;
  workArea: WorkArea | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

const DeleteWorkAreaConfirmationDialog: React.FC<
  DeleteWorkAreaConfirmationDialogProps
> = ({ open, workArea, onClose, onConfirm, isLoading }) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to delete work area:", error);
    }
  };

  const taskCount = workArea?.workTasks?.length || 0;

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
        Delete Work Area
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2, color: "#2C2C2C" }}>
            Are you sure you want to delete this work area?
          </Typography>

          {workArea && (
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
                  {workArea.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TaskIcon sx={{ fontSize: 16, color: "#FF9800" }} />
                  <Chip
                    label={`${taskCount} tasks`}
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
              {workArea.description && (
                <Typography variant="body2" sx={{ mt: 1, color: "#BF360C" }}>
                  {workArea.description}
                </Typography>
              )}
            </Box>
          )}

          <Typography variant="body2" sx={{ color: "#666666", mb: 1 }}>
            ⚠️ This action cannot be undone. This will:
          </Typography>

          <Box component="ul" sx={{ pl: 2, color: "#666666" }}>
            <Typography component="li" variant="body2">
              Permanently delete the work area
            </Typography>
            <Typography component="li" variant="body2">
              Delete all {taskCount} task{taskCount !== 1 ? "s" : ""} in this
              work area
            </Typography>
            <Typography component="li" variant="body2">
              Remove all task objectives and sub-tasks
            </Typography>
            <Typography component="li" variant="body2">
              This cannot be recovered
            </Typography>
          </Box>

          {taskCount > 0 && (
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
                This work area contains {taskCount} task
                {taskCount !== 1 ? "s" : ""}. All tasks and their related data
                will be permanently lost.
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
            "Delete Work Area"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteWorkAreaConfirmationDialog;
