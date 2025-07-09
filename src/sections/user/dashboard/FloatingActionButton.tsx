import React from "react";
import { Fab } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

interface FloatingActionButtonProps {
  onCreateProject: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onCreateProject,
}) => {
  return (
    <Fab
      aria-label="add project"
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        bgcolor: "#2C2C2C",
        color: "white",
        "&:hover": {
          bgcolor: "#1A1A1A",
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(44, 44, 44, 0.2)",
        },
        transition: "all 0.25s ease",
      }}
      onClick={onCreateProject}
    >
      <AddIcon />
    </Fab>
  );
};
