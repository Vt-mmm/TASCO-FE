import React from "react";
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

interface ProjectFormHeaderProps {
  onCancel: () => void;
}

const ProjectFormHeader: React.FC<ProjectFormHeaderProps> = ({
  onCancel,
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
      <IconButton
        onClick={onCancel}
        sx={{
          mr: 2,
          color: "#2C2C2C",
          "&:hover": {
            backgroundColor: "rgba(44, 44, 44, 0.04)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#2C2C2C",
          }}
        >
          Create New Project
        </Typography>
        <Typography variant="body1" sx={{ color: "#666666" }}>
          Set up a new project to organize your team's work
        </Typography>
      </Box>
    </Box>
  );
};

export default ProjectFormHeader;
