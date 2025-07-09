import React from "react";
import {
  Box,
  Typography,
  Button,
  Pagination,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "../../../common/models/project";

interface ProjectsGridProps {
  projects: Project[];
  currentUserId?: string;
  onJoinProject: (projectId: string) => Promise<void>;
  onViewProject: (projectId: string) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  // Pagination props
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  currentUserId,
  onJoinProject,
  onViewProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  totalCount,
  pageCount,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
}) => {
  if (projects.length === 0 && !isLoading) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          border: "2px dashed rgba(44, 44, 44, 0.2)",
          borderRadius: 3,
          bgcolor: "white",
        }}
      >
        <AssignmentIcon sx={{ fontSize: 64, color: "#2C2C2C", mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, color: "#2C2C2C" }}>
          {totalCount === 0
            ? "No projects found"
            : "No projects match your search"}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: "#666666" }}>
          {totalCount === 0
            ? "Start by creating your first project."
            : "Try adjusting your search criteria or create a new project."}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateProject}
          sx={{
            bgcolor: "#2C2C2C",
            "&:hover": { bgcolor: "#1A1A1A" },
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            py: 1.2,
          }}
        >
          Create {totalCount === 0 ? "Your First" : "New"} Project
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Projects Grid */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            currentUserId={currentUserId}
            onJoinProject={onJoinProject}
            onViewProject={onViewProject}
            onEditProject={onEditProject}
            onDeleteProject={onDeleteProject}
          />
        ))}
      </Box>

      {/* Pagination Section */}
      {(pageCount > 1 || totalCount > pageSize) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            px: 2,
            py: 3,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {/* Page size selector */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "#666666", whiteSpace: "nowrap" }}
            >
              Items per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                sx={{
                  "& .MuiSelect-select": {
                    py: 1,
                    fontSize: "0.875rem",
                  },
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Results info */}
          <Typography
            variant="body2"
            sx={{
              color: "#666666",
              fontSize: "0.875rem",
              display: { xs: "none", sm: "block" },
            }}
          >
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}–
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
            projects
          </Typography>

          {/* Pagination controls */}
          <Pagination
            count={Math.max(pageCount, Math.ceil(totalCount / pageSize))}
            page={currentPage}
            onChange={onPageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
            disabled={isLoading}
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "0.875rem",
              },
              "& .Mui-selected": {
                backgroundColor: "#2C2C2C !important",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1A1A1A !important",
                },
              },
              "& .MuiPaginationItem-root:hover": {
                backgroundColor: "rgba(44, 44, 44, 0.08)",
              },
            }}
          />
        </Box>
      )}

      {/* Summary info for mobile when pagination is hidden */}
      {(pageCount > 1 || totalCount > pageSize) && (
        <Typography
          variant="body2"
          sx={{
            color: "#666666",
            fontSize: "0.875rem",
            textAlign: "center",
            mt: 2,
            display: { xs: "block", sm: "none" },
          }}
        >
          Page {currentPage} of{" "}
          {Math.max(pageCount, Math.ceil(totalCount / pageSize))} ({totalCount}{" "}
          total projects)
        </Typography>
      )}
    </Box>
  );
};
