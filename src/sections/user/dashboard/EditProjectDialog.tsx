import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { UpdateProjectRequest } from "../../../common/models/project";
import type { Project } from "../../../common/models/project";

interface EditProjectDialogProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (projectData: UpdateProjectRequest) => Promise<void>;
  isLoading: boolean;
}

const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  open,
  project,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UpdateProjectRequest>({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
      });
    }
  }, [project]);

  const handleInputChange =
    (field: keyof UpdateProjectRequest) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Project name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Clean up the data before submitting
    const cleanedData: UpdateProjectRequest = {
      name: formData.name?.trim(),
      description: formData.description?.trim() || undefined,
    };

    try {
      await onSubmit(cleanedData);
      handleClose();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        }}
      >
        Edit Project
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Project Name */}
          <TextField
            label="Project Name"
            value={formData.name || ""}
            onChange={handleInputChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Description */}
          <TextField
            label="Description"
            value={formData.description || ""}
            onChange={handleInputChange("description")}
            multiline
            rows={4}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{
            borderRadius: 2,
            px: 3,
            backgroundColor: "#494A7E",
            "&:hover": {
              backgroundColor: "#3D3E6B",
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Updating...
            </Box>
          ) : (
            "Update Project"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProjectDialog;
