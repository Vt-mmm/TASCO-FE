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
import {
  UpdateWorkAreaRequest,
  WorkArea,
} from "../../../common/models/workArea";

interface EditWorkAreaDialogProps {
  open: boolean;
  workArea: WorkArea | null;
  onClose: () => void;
  onSubmit: (workAreaData: UpdateWorkAreaRequest) => Promise<void>;
  isLoading: boolean;
}

const EditWorkAreaDialog: React.FC<EditWorkAreaDialogProps> = ({
  open,
  workArea,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UpdateWorkAreaRequest>({
    name: "",
    description: "",
    displayOrder: 0,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    displayOrder?: string;
  }>({});

  // Update form data when workArea changes
  useEffect(() => {
    if (workArea) {
      setFormData({
        name: workArea.name,
        description: workArea.description || "",
        displayOrder: workArea.displayOrder,
      });
    }
  }, [workArea]);

  const handleInputChange =
    (field: keyof UpdateWorkAreaRequest) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: unknown } }
    ) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: field === "displayOrder" ? Number(value) : value,
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
    const newErrors: { name?: string; displayOrder?: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Work area name is required";
    }

    if (formData.displayOrder < 0) {
      newErrors.displayOrder = "Display order must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Clean up the data before submitting
    const cleanedData: UpdateWorkAreaRequest = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      displayOrder: formData.displayOrder,
    };

    try {
      await onSubmit(cleanedData);
      handleClose();
    } catch (error) {
      console.error("Failed to update work area:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      displayOrder: 0,
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
        Edit Work Area
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Work Area Name */}
          <TextField
            label="Work Area Name"
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
            rows={3}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Display Order */}
          <TextField
            label="Display Order"
            type="number"
            value={formData.displayOrder || 0}
            onChange={handleInputChange("displayOrder")}
            error={!!errors.displayOrder}
            helperText={
              errors.displayOrder ||
              "Controls the order of work areas (0 = first)"
            }
            fullWidth
            inputProps={{ min: 0 }}
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
            "Update Work Area"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditWorkAreaDialog;
