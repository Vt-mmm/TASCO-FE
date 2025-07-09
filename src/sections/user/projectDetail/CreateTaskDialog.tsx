import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import { CreateWorkTaskRequest } from "../../../common/models/workArea";

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: CreateWorkTaskRequest) => Promise<void>;
  isLoading: boolean;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateWorkTaskRequest>({
    title: "",
    description: "",
    status: "NEW",
    priority: "MEDIUM",
    startDate: "",
    endDate: "",
    dueDate: "",
  });

  const [errors, setErrors] = useState<{
    title?: string;
  }>({});

  const handleInputChange =
    (field: keyof CreateWorkTaskRequest) =>
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

  const handleSelectChange =
    (field: keyof CreateWorkTaskRequest) => (event: SelectChangeEvent) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleDateChange =
    (field: keyof CreateWorkTaskRequest) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value ? new Date(value).toISOString() : "",
      }));
    };

  const validateForm = (): boolean => {
    const newErrors: { title?: string } = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Task title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Clean up the data before submitting
    const cleanedData: CreateWorkTaskRequest = {
      ...formData,
      description: formData.description?.trim() || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      dueDate: formData.dueDate || undefined,
    };

    try {
      await onSubmit(cleanedData);
      handleClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      status: "NEW",
      priority: "MEDIUM",
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
        Create New Task
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Task Title */}
          <TextField
            label="Task Title"
            value={formData.title}
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
            value={formData.description}
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

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={handleSelectChange("status")}
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="NEW">New</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="REVIEW">Review</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </Select>
          </FormControl>

          {/* Priority */}
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={handleSelectChange("priority")}
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="LOW">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#4CAF50",
                    }}
                  />
                  Low
                </Box>
              </MenuItem>
              <MenuItem value="MEDIUM">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#FF9800",
                    }}
                  />
                  Medium
                </Box>
              </MenuItem>
              <MenuItem value="HIGH">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#F44336",
                    }}
                  />
                  High
                </Box>
              </MenuItem>
              <MenuItem value="URGENT">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#9C27B0",
                    }}
                  />
                  Urgent
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Start Date */}
          <TextField
            label="Start Date"
            type="date"
            value={formData.startDate ? formData.startDate.split("T")[0] : ""}
            onChange={handleDateChange("startDate")}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* End Date */}
          <TextField
            label="End Date"
            type="date"
            value={formData.endDate ? formData.endDate.split("T")[0] : ""}
            onChange={handleDateChange("endDate")}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Due Date */}
          <TextField
            label="Due Date"
            type="date"
            value={formData.dueDate ? formData.dueDate.split("T")[0] : ""}
            onChange={handleDateChange("dueDate")}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
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
              Creating...
            </Box>
          ) : (
            "Create Task"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Export component for WorkAreaColumn
export { CreateTaskDialog };
export default CreateTaskDialog;
