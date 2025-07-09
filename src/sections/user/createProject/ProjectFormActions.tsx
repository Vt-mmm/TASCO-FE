import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";

interface ProjectFormActionsProps {
  isCreating: boolean;
  isValid: boolean;
  onReset: () => void;
  onCancel: () => void;
}

const ProjectFormActions: React.FC<ProjectFormActionsProps> = ({
  isCreating,
  isValid,
  onReset,
  onCancel,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "flex-end",
        mt: 4,
      }}
    >
      <Button
        variant="outlined"
        onClick={onReset}
        disabled={isCreating}
        sx={{
          borderColor: "#D4C4B0",
          color: "#666666",
          "&:hover": {
            borderColor: "#2C2C2C",
            backgroundColor: "rgba(44, 44, 44, 0.04)",
            color: "#2C2C2C",
          },
        }}
      >
        Reset
      </Button>
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={isCreating}
        sx={{
          borderColor: "#D4C4B0",
          color: "#666666",
          "&:hover": {
            borderColor: "#2C2C2C",
            backgroundColor: "rgba(44, 44, 44, 0.04)",
            color: "#2C2C2C",
          },
        }}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="contained"
        startIcon={
          isCreating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
        }
        disabled={!isValid || isCreating}
        sx={{ 
          minWidth: 120,
          bgcolor: "#2C2C2C",
          color: "white",
          fontWeight: 600,
          "&:hover": {
            bgcolor: "#1A1A1A",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(44, 44, 44, 0.2)",
          },
          "&:disabled": {
            bgcolor: "#D4C4B0",
            color: "#666666",
          },
          transition: "all 0.25s ease",
        }}
      >
        {isCreating ? "Creating..." : "Create Project"}
      </Button>
    </Box>
  );
};

export default ProjectFormActions;
