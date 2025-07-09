import React from "react";
import {
  Box,
  Typography,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material";
import { TaskObjective } from "../../../common/models/workArea";

interface ObjectiveCardProps {
  objective: TaskObjective;
  onEdit?: (objective: TaskObjective) => void;
  onDelete?: (objective: TaskObjective) => void;
  onToggleComplete?: (objective: TaskObjective, isCompleted: boolean) => void;
  isCompleting?: boolean;
  showActions?: boolean;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  onEdit,
  onDelete,
  onToggleComplete,
  isCompleting = false,
  showActions = true,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit?.(objective);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete?.(objective);
  };

  const handleToggleComplete = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onToggleComplete?.(objective, event.target.checked);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid #E0E0E0",
        borderRadius: 2,
        backgroundColor: objective.isCompleted ? "#F8F9FA" : "#FFFFFF",
        transition: "all 0.2s ease-in-out",
        position: "relative",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          borderColor: "#BDBDBD",
        },
      }}
    >
      {/* Header with checkbox and actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
          {/* Completion checkbox */}
          <Tooltip
            title={
              objective.isCompleted ? "Mark as incomplete" : "Mark as complete"
            }
          >
            <Checkbox
              checked={objective.isCompleted}
              onChange={handleToggleComplete}
              disabled={isCompleting}
              icon={<RadioButtonUncheckedIcon />}
              checkedIcon={<CheckCircleIcon />}
              sx={{
                p: 0.5,
                mr: 1,
                mt: -0.5,
                color: objective.isCompleted ? "#4CAF50" : "#9E9E9E",
                "&.Mui-checked": {
                  color: "#4CAF50",
                },
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            />
          </Tooltip>

          {/* Title and content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: objective.isCompleted ? "#757575" : "#2C2C2C",
                textDecoration: objective.isCompleted ? "line-through" : "none",
                wordBreak: "break-word",
                mb: 0.5,
              }}
            >
              {objective.title}
            </Typography>

            {objective.description && (
              <Typography
                variant="body2"
                sx={{
                  color: objective.isCompleted ? "#9E9E9E" : "#666666",
                  textDecoration: objective.isCompleted
                    ? "line-through"
                    : "none",
                  wordBreak: "break-word",
                  mb: 1,
                }}
              >
                {objective.description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Actions menu */}
        {showActions && (
          <Box sx={{ ml: 1 }}>
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{
                color: "#9E9E9E",
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  minWidth: 150,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: "#F44336" }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" sx={{ color: "#F44336" }} />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>

      {/* Footer with metadata */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 1.5,
        }}
      >
        {/* Status chip */}
        <Chip
          label={objective.isCompleted ? "Completed" : "In Progress"}
          size="small"
          sx={{
            backgroundColor: objective.isCompleted ? "#E8F5E8" : "#FFF3E0",
            color: objective.isCompleted ? "#2E7D32" : "#F57C00",
            fontWeight: 500,
            fontSize: "0.75rem",
            height: 24,
          }}
        />

        {/* Dates */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {objective.createdDate && (
            <Typography
              variant="caption"
              sx={{
                color: "#9E9E9E",
                fontSize: "0.75rem",
              }}
            >
              Created: {formatDate(objective.createdDate)}
            </Typography>
          )}
          {objective.completedDate && (
            <Typography
              variant="caption"
              sx={{
                color: "#4CAF50",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              Completed: {formatDate(objective.completedDate)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ObjectiveCard;
