import React from "react";
import { Alert } from "@mui/material";

interface ProjectFormErrorDisplayProps {
  error?: string | null;
  submitError?: string | null;
}

const ProjectFormErrorDisplay: React.FC<ProjectFormErrorDisplayProps> = ({
  error,
  submitError,
}) => {
  if (!error && !submitError) return null;

  return (
    <Alert
      severity="error"
      sx={{
        mb: 3,
        backgroundColor: "rgba(244, 67, 54, 0.1)",
        border: "1px solid rgba(244, 67, 54, 0.2)",
        borderRadius: 2,
        "& .MuiAlert-icon": {
          color: "#d32f2f",
        },
        "& .MuiAlert-message": {
          color: "#2C2C2C",
          fontWeight: 500,
        },
      }}
    >
      {error || submitError}
    </Alert>
  );
};

export default ProjectFormErrorDisplay;
