import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/configStore";
import {
  CreateTaskObjectiveRequest,
  WorkTask,
} from "../../../common/models/workArea";
import { createTaskObjectiveThunk } from "../../../redux/taskObjectives/taskObjectivesThunks";

interface CreateObjectiveDialogProps {
  open: boolean;
  onClose: () => void;
  workTask: WorkTask | null;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  displayOrder: number;
}

interface FormErrors {
  title?: string;
  description?: string;
  displayOrder?: string;
}

const CreateObjectiveDialog: React.FC<CreateObjectiveDialogProps> = ({
  open,
  onClose,
  workTask,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isCreating, createError, objectivesByWorkTask } = useAppSelector(
    (state) => state.taskObjectives
  );

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    displayOrder: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && workTask) {
      // Auto-set display order to next available position
      const existingObjectives = objectivesByWorkTask[workTask.id] || [];
      const nextDisplayOrder =
        existingObjectives.length > 0
          ? Math.max(...existingObjectives.map((obj) => obj.displayOrder)) + 1
          : 0;

      setFormData({
        title: "",
        description: "",
        displayOrder: nextDisplayOrder,
      });
      setErrors({});
      setTouched({});
    }
  }, [open, workTask, objectivesByWorkTask]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    // Description validation (optional but with max length)
    if (formData.description.trim().length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    // Display order validation
    if (formData.displayOrder < 0) {
      newErrors.displayOrder = "Display order must be non-negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "displayOrder"
          ? parseInt(event.target.value) || 0
          : event.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleBlur = (field: keyof FormData) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
    validateForm();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!workTask) return;

    // Mark all fields as touched
    setTouched({
      title: true,
      description: true,
      displayOrder: true,
    });

    if (!validateForm()) return;

    try {
      const objectiveData: CreateTaskObjectiveRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        displayOrder: formData.displayOrder,
      };

      await dispatch(
        createTaskObjectiveThunk({
          workTaskId: workTask.id,
          objectiveData,
        })
      ).unwrap();

      // Success
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to create objective:", error);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon sx={{ color: "#4CAF50" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create New Objective
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isCreating}
          sx={{
            color: "#9E9E9E",
            "&:hover": {
              backgroundColor: "#F5F5F5",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {/* Work Task Info */}
          {workTask && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#F8F9FA",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="body2" sx={{ color: "#666666", mb: 0.5 }}>
                Adding objective to:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {workTask.name}
              </Typography>
            </Box>
          )}

          {/* Error alert */}
          {createError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {createError}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Title */}
            <FormControl fullWidth error={touched.title && !!errors.title}>
              <InputLabel htmlFor="objective-title">Title *</InputLabel>
              <OutlinedInput
                id="objective-title"
                label="Title *"
                value={formData.title}
                onChange={handleInputChange("title")}
                onBlur={handleBlur("title")}
                placeholder="Enter objective title..."
                disabled={isCreating}
                sx={{ borderRadius: 2 }}
              />
              {touched.title && errors.title && (
                <Typography
                  variant="caption"
                  sx={{ color: "#F44336", mt: 0.5, ml: 1 }}
                >
                  {errors.title}
                </Typography>
              )}
            </FormControl>

            {/* Description */}
            <TextField
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange("description")}
              onBlur={handleBlur("description")}
              placeholder="Describe what needs to be accomplished..."
              disabled={isCreating}
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
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
              value={formData.displayOrder}
              onChange={handleInputChange("displayOrder")}
              onBlur={handleBlur("displayOrder")}
              disabled={isCreating}
              error={touched.displayOrder && !!errors.displayOrder}
              helperText={
                touched.displayOrder && errors.displayOrder
                  ? errors.displayOrder
                  : "Lower numbers appear first"
              }
              InputProps={{
                inputProps: {
                  min: 0,
                  step: 1,
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isCreating}
            sx={{
              color: "#666666",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isCreating || !formData.title.trim()}
            startIcon={
              isCreating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
            sx={{
              backgroundColor: "#4CAF50",
              color: "white",
              "&:hover": {
                backgroundColor: "#45A049",
              },
              "&:disabled": {
                backgroundColor: "#E0E0E0",
                color: "#9E9E9E",
              },
            }}
          >
            {isCreating ? "Creating..." : "Create Objective"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateObjectiveDialog;
