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
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/configStore";
import {
  TaskObjective,
  UpdateTaskObjectiveRequest,
} from "../../../common/models/workArea";
import { updateTaskObjectiveThunk } from "../../../redux/taskObjectives/taskObjectivesThunks";

interface EditObjectiveDialogProps {
  open: boolean;
  onClose: () => void;
  objective: TaskObjective | null;
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

const EditObjectiveDialog: React.FC<EditObjectiveDialogProps> = ({
  open,
  onClose,
  objective,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isUpdating, updateError } = useAppSelector(
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

  // Reset form when dialog opens/closes or objective changes
  useEffect(() => {
    if (open && objective) {
      setFormData({
        title: objective.title || "",
        description: objective.description || "",
        displayOrder: objective.displayOrder || 0,
      });
      setErrors({});
      setTouched({});
    }
  }, [open, objective]);

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

  // Check if form has changes
  const hasChanges = (): boolean => {
    if (!objective) return false;

    return (
      formData.title.trim() !== (objective.title || "") ||
      formData.description.trim() !== (objective.description || "") ||
      formData.displayOrder !== (objective.displayOrder || 0)
    );
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

    if (!objective) return;

    // Mark all fields as touched
    setTouched({
      title: true,
      description: true,
      displayOrder: true,
    });

    if (!validateForm()) return;

    // Check if there are actually changes to save
    if (!hasChanges()) {
      onClose();
      return;
    }

    try {
      const objectiveData: UpdateTaskObjectiveRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        displayOrder: formData.displayOrder,
      };

      await dispatch(
        updateTaskObjectiveThunk({
          workTaskId: objective.workTaskId,
          objectiveId: objective.id,
          objectiveData,
        })
      ).unwrap();

      // Success
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update objective:", error);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
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
          <EditIcon sx={{ color: "#FF9800" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Objective
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isUpdating}
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
          {/* Objective Info */}
          {objective && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#F8F9FA",
                borderRadius: 2,
                mb: 3,
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
                <Typography variant="body2" sx={{ color: "#666666" }}>
                  Editing objective:
                </Typography>
                <Chip
                  label={objective.isCompleted ? "Completed" : "In Progress"}
                  size="small"
                  sx={{
                    backgroundColor: objective.isCompleted
                      ? "#E8F5E8"
                      : "#FFF3E0",
                    color: objective.isCompleted ? "#2E7D32" : "#F57C00",
                    fontWeight: 500,
                  }}
                />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {objective.title}
              </Typography>
              {objective.createdDate && (
                <Typography variant="caption" sx={{ color: "#9E9E9E" }}>
                  Created: {formatDate(objective.createdDate)}
                </Typography>
              )}
              {objective.completedDate && (
                <Typography variant="caption" sx={{ color: "#4CAF50", ml: 2 }}>
                  Completed: {formatDate(objective.completedDate)}
                </Typography>
              )}
            </Box>
          )}

          {/* Error alert */}
          {updateError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {updateError}
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
                disabled={isUpdating}
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
              disabled={isUpdating}
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
              disabled={isUpdating}
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
            disabled={isUpdating}
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
            disabled={isUpdating || !formData.title.trim() || !hasChanges()}
            startIcon={
              isUpdating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
            sx={{
              backgroundColor: "#FF9800",
              color: "white",
              "&:hover": {
                backgroundColor: "#F57C00",
              },
              "&:disabled": {
                backgroundColor: "#E0E0E0",
                color: "#9E9E9E",
              },
            }}
          >
            {isUpdating
              ? "Updating..."
              : hasChanges()
              ? "Update Objective"
              : "No Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditObjectiveDialog;
 