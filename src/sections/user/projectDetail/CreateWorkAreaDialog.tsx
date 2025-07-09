import React, { useState } from "react";
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
import { CreateWorkAreaRequest } from "../../../common/models/workArea";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreateWorkArea: (workAreaData: CreateWorkAreaRequest) => Promise<void>;
  isCreating?: boolean;
}

const CreateWorkAreaDialog: React.FC<Props> = ({
  open,
  onClose,
  onCreateWorkArea,
  isCreating = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Work area name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Work area name must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.description;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const workAreaData: CreateWorkAreaRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        displayOrder: 1, // Will be updated by backend
      };

      await onCreateWorkArea(workAreaData);
      handleClose();
    } catch (error) {
      console.error("Failed to create work area:", error);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setErrors({ name: "", description: "" });
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
        }
      }}
    >
        <DialogTitle sx={{ fontWeight: 700, color: "#2C2C2C" }}>
          Create New Work Area
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <TextField
              label="Work Area Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              variant="outlined"
              placeholder="e.g., Backend Development, UI/UX Design"
              disabled={isCreating}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Describe what this work area will be used for..."
              disabled={isCreating}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleClose}
            disabled={isCreating}
            sx={{ 
              color: "#666666",
              "&:hover": {
                backgroundColor: "rgba(44, 44, 44, 0.04)",
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: "#2C2C2C",
              color: "white",
              borderRadius: 2,
              px: 3,
              "&:hover": {
                backgroundColor: "#1a1a1a",
              },
              "&:disabled": {
                backgroundColor: "#E0E0E0",
                color: "#9E9E9E",
              }
            }}
          >
            {isCreating ? "Creating..." : "Create Work Area"}        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateWorkAreaDialog;
