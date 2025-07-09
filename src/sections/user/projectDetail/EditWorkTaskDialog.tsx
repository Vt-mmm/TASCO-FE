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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  UpdateWorkTaskRequest,
  WorkTask,
} from "../../../common/models/workArea";

interface EditWorkTaskDialogProps {
  open: boolean;
  workTask: WorkTask | null;
  onClose: () => void;
  onSubmit: (workTaskData: UpdateWorkTaskRequest) => Promise<void>;
  isLoading: boolean;
}

const EditWorkTaskDialog: React.FC<EditWorkTaskDialogProps> = ({
  open,
  workTask,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UpdateWorkTaskRequest>({
    title: "",
    description: "",
    status: "",
    priority: "",
    startDate: "",
    endDate: "",
    dueDate: "",
  });

  const [errors, setErrors] = useState<{
    title?: string;
    startDate?: string;
    endDate?: string;
    dueDate?: string;
  }>({});

  // Mapping functions between frontend and backend formats
  const mapFrontendToBackendStatus = (frontendStatus: string): string => {
    const statusMap: Record<string, string> = {
      todo: "Todo",
      in_progress: "InProgress",
      review: "Review",
      done: "Done",
    };
    return statusMap[frontendStatus] || frontendStatus;
  };

  const mapFrontendToBackendPriority = (frontendPriority: string): string => {
    const priorityMap: Record<string, string> = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    };
    return priorityMap[frontendPriority] || frontendPriority;
  };

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      // Convert ISO date to YYYY-MM-DD format for date input
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Update form data when workTask changes
  useEffect(() => {
    if (workTask) {
      setFormData({
        title: workTask.name, // Map name to title for backend
        description: workTask.description || "",
        status: mapFrontendToBackendStatus(workTask.status || ""),
        priority: mapFrontendToBackendPriority(workTask.priority || ""),
        startDate: formatDateForInput(workTask.startDate),
        endDate: formatDateForInput(workTask.endDate),
        dueDate: formatDateForInput(workTask.dueDate),
      });
    }
  }, [workTask]);

  const handleInputChange =
    (field: keyof UpdateWorkTaskRequest) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: unknown } }
    ) => {
      const value = event.target.value as string;
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
    const newErrors: {
      title?: string;
      startDate?: string;
      endDate?: string;
      dueDate?: string;
    } = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Task title is required";
    }

    // Validate date formats (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (formData.startDate && !dateRegex.test(formData.startDate)) {
      newErrors.startDate = "Start date must be in YYYY-MM-DD format";
    }

    if (formData.endDate && !dateRegex.test(formData.endDate)) {
      newErrors.endDate = "End date must be in YYYY-MM-DD format";
    }

    if (formData.dueDate && !dateRegex.test(formData.dueDate)) {
      newErrors.dueDate = "Due date must be in YYYY-MM-DD format";
    }

    // Validate date logic
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.startDate) > new Date(formData.dueDate)) {
        newErrors.dueDate = "Due date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Clean up the data before submitting
    const cleanedData: UpdateWorkTaskRequest = {
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      status: formData.status || undefined,
      priority: formData.priority || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      dueDate: formData.dueDate || undefined,
    };

    try {
      await onSubmit(cleanedData);
      handleClose();
    } catch (error) {
      console.error("Failed to update work task:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      status: "",
      priority: "",
      startDate: "",
      endDate: "",
      dueDate: "",
    });
    setErrors({});
    onClose();
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
        Edit Work Task
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Task Title */}
          <TextField
            label="Task Title"
            value={formData.title || ""}
            onChange={handleInputChange("title")}
            error={!!errors.title}
            helperText={errors.title}
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

          {/* Row 1: Status and Priority */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status || ""}
                label="Status"
                onChange={handleInputChange("status")}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Todo">To Do</MenuItem>
                <MenuItem value="InProgress">In Progress</MenuItem>
                <MenuItem value="Review">Review</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority || ""}
                label="Priority"
                onChange={handleInputChange("priority")}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Row 2: Start Date and End Date */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={formData.startDate || ""}
              onChange={handleInputChange("startDate")}
              error={!!errors.startDate}
              helperText={errors.startDate || "YYYY-MM-DD format"}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="End Date"
              type="date"
              value={formData.endDate || ""}
              onChange={handleInputChange("endDate")}
              error={!!errors.endDate}
              helperText={errors.endDate || "YYYY-MM-DD format"}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Due Date */}
          <TextField
            label="Due Date"
            type="date"
            value={formData.dueDate || ""}
            onChange={handleInputChange("dueDate")}
            error={!!errors.dueDate}
            helperText={errors.dueDate || "YYYY-MM-DD format"}
            fullWidth
            InputLabelProps={{ shrink: true }}
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
            "Update Task"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditWorkTaskDialog;
