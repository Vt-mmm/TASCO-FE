import React from "react";
import { Box, Typography } from "@mui/material";

const ProjectFormHelpText: React.FC = () => {
  return (
    <Box
      sx={{
        mt: 3,
        p: 3,
        bgcolor: "#E8DDD0",
        borderRadius: 2,
        border: "1px solid #D4C4B0",
      }}
    >
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: 1, 
          color: "#2C2C2C",
          fontWeight: 600 
        }}
      >
        💡 Getting Started Tips
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ color: "#666666" }}
      >
        • Choose a clear, descriptive name for your project
        <br />
        • Write a detailed description to help team members understand the
        project goals
        <br />• After creating the project, you can add team members and
        create work areas to organize tasks
      </Typography>
    </Box>
  );
};

export default ProjectFormHelpText;
