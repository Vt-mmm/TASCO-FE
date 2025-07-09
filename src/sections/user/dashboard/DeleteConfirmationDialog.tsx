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
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import type { Project } from "../../../common/models/project";

interface DeleteConfirmationDialogProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  project,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to delete project:", error);
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
        Delete Project
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2, color: "#2C2C2C" }}>
            Are you sure you want to delete this project?
          </Typography>

          {project && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#FFF3E0",
                border: "1px solid #FFB74D",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#E65100" }}
              >
                {project.name}
              </Typography>
              {project.description && (
                <Typography variant="body2" sx={{ mt: 1, color: "#BF360C" }}>
                  {project.description}
                </Typography>
              )}
            </Box>
          )}

          <Typography variant="body2" sx={{ color: "#666666", mb: 1 }}>
            ⚠️ This action cannot be undone. This will:
          </Typography>

          <Box component="ul" sx={{ pl: 2, color: "#666666" }}>
            <Typography component="li" variant="body2">
              Permanently delete the project and all its data
            </Typography>
            <Typography component="li" variant="body2">
              Remove all work areas and tasks
            </Typography>
            <Typography component="li" variant="body2">
              Remove all project members and their access
            </Typography>
          </Box>
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
            "Delete Project"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
