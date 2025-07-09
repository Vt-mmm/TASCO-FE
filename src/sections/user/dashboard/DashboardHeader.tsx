import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

interface DashboardHeaderProps {
  displayName: string;
  projectCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateProject: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  displayName,
  projectCount,
  searchTerm,
  onSearchChange,
  onCreateProject,
}) => {
  return (
    <>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            color: "#2C2C2C",
          }}
        >
          Welcome back, {displayName}! 👋
        </Typography>
        <Typography variant="body1" sx={{ 
          fontSize: "1.1rem",
          color: "#666666"
        }}>
          Here's what's happening with your projects today.
        </Typography>
      </Box>

      {/* Projects Section Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ 
          fontWeight: 700,
          color: "#2C2C2C"
        }}>
          My Projects ({projectCount})
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search projects…"
            size="small"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ 
              width: { xs: "100%", sm: 240 },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "rgba(44, 44, 44, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "#2C2C2C",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2C2C2C",
                  borderWidth: 2,
                },
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateProject}
            sx={{
              textTransform: "none",
              bgcolor: "#2C2C2C",
              color: "white",
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: 2,
              "&:hover": { 
                bgcolor: "#1A1A1A",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(44, 44, 44, 0.2)"
              },
              boxShadow: "0 2px 8px rgba(44, 44, 44, 0.1)",
              transition: "all 0.25s ease"
            }}
          >
            New Project
          </Button>
        </Box>
      </Box>
    </>
  );
};
