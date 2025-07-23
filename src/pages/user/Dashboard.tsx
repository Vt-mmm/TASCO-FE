import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Container, Alert, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/configStore";
import {
  getMyProjectsThunk,
  updateProjectThunk,
  deleteProjectThunk,
} from "../../redux/projects/projectsThunks";
import {
  setCurrentPage,
  setPageSize,
} from "../../redux/projects/projectsSlice";
import { applyToProjectThunk } from "../../redux/projectMembers/projectMembersThunks";
import { Header } from "../../layout/components/header";
import { PATH_USER } from "../../routes/paths";
import {
  DashboardHeader,
  ProjectsGrid,
  DashboardSkeleton,
  FloatingActionButton,
} from "../../sections/user/dashboard";
import EditProjectDialog from "../../sections/user/dashboard/EditProjectDialog";
import DeleteConfirmationDialog from "../../sections/user/dashboard/DeleteConfirmationDialog";

import type {
  Project,
  UpdateProjectRequest,
} from "../../common/models/project";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    projects,
    isLoading,
    error,
    isUpdating,
    isDeleting,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
  } = useAppSelector((state) => state.projects);
  const { userAuth } = useAppSelector((state) => state.auth);

  // Local search/filter state
  const [searchTerm, setSearchTerm] = useState("");

  // Loading delay state to prevent flash loading
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Derived filtered projects - now search is handled by backend
  const displayProjects = useMemo(() => {
    return projects.filter((p): p is Project => {
      if (!p) return false;
      return typeof p.name === "string" && p.name.length > 0;
    });
  }, [projects]);

  // Helper to get display name for greeting
  const displayName = useMemo(() => {
    if (!userAuth) return "User";
    // Try firstName field, fallback to username before '@'
    // @ts-expect-error - firstName may exist when extended profile is present
    const firstName = userAuth.firstName as string | undefined;
    if (firstName) return firstName;
    if (userAuth.username) return userAuth.username.split("@")[0];
    return "User";
  }, [userAuth]);

  // Load projects with pagination and search
  const loadProjects = useCallback(
    (page: number = currentPage, search: string = searchTerm) => {
      dispatch(
        getMyProjectsThunk({
          pageNumber: page,
          pageSize: pageSize,
          search: search,
          isDelete: false,
        })
      );
    },
    [dispatch, currentPage, pageSize, searchTerm]
  );

  useEffect(() => {
    loadProjects(1, searchTerm);
  }, [loadProjects, searchTerm]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadProjects(1, searchTerm);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadProjects]);

  // Handle loading overlay with delay to prevent flash
  useEffect(() => {
    let timeoutId: number;

    const shouldShowOverlay =
      isLoading && projects.length > 0 && currentPage >= 1;

    if (shouldShowOverlay) {
      timeoutId = window.setTimeout(() => {
        setShowLoadingOverlay(true);
      }, 300); // Show overlay after 300ms delay
    } else {
      setShowLoadingOverlay(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, projects.length, currentPage]);

  const handleCreateProject = () => {
    navigate(PATH_USER.projectCreate);
  };

  const handleJoinProject = async (projectId: string) => {
    try {
      await dispatch(
        applyToProjectThunk({
          projectId,
          applicationData: {
            message: "I would like to join this project",
          },
        })
      ).unwrap();
      // Refresh current page to see updated status
      loadProjects(currentPage, searchTerm);
    } catch (error) {
      console.error("❌ Failed to apply to project:", error);
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(PATH_USER.projectDetail(projectId));
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleUpdateProject = async (projectData: UpdateProjectRequest) => {
    if (!selectedProject) return;

    try {
      const result = await dispatch(
        updateProjectThunk({
          projectId: selectedProject.id,
          projectData,
        })
      ).unwrap();

      // If we got a valid result, Redux will handle the update automatically
      // If not, we might need to refresh the data
      if (!result || !result.id) {
        loadProjects(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("❌ Failed to update project:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProject) return;

    try {
      await dispatch(deleteProjectThunk(selectedProject.id)).unwrap();
      // Redux state will be automatically updated by deleteProjectThunk.fulfilled
      // No need to refresh manually
    } catch (error) {
      console.error("❌ Failed to delete project:", error);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProject(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  // Handle pagination change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    dispatch(setCurrentPage(page));
    loadProjects(page, searchTerm);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    dispatch(setPageSize(newPageSize));
    // setPageSize action automatically resets to page 1
    loadProjects(1, searchTerm);
  };

  // Skeleton loader placeholder
  const renderSkeleton = () => <DashboardSkeleton />;

  // Determine if this is initial load (no projects data yet)
  const isInitialLoad = isLoading && !projects.length && currentPage === 1;

  // Show full skeleton only for initial load
  if (isInitialLoad) {
    return (
      <Box>
        <Header />
        <Container sx={{ py: 4 }}>{renderSkeleton()}</Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#FAFAFA",
        minHeight: "100vh",
      }}
    >
      <Header />

      <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
        {/* Dashboard Header */}
        <DashboardHeader
          displayName={displayName}
          projectCount={totalCount}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateProject={handleCreateProject}
        />

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Projects Section */}
        <Box sx={{ mb: 4, position: "relative" }}>
          {/* Only show overlay loading when we have existing content (not initial load) */}
          {showLoadingOverlay && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(255,255,255,0.7)",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                borderRadius: 2,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    border: "2px solid #f3f3f3",
                    borderTop: "2px solid #2C2C2C",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    mx: "auto",
                    mb: 1,
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Updating...
                </Typography>
              </Box>
            </Box>
          )}
          <ProjectsGrid
            projects={displayProjects}
            currentUserId={userAuth?.userId}
            onJoinProject={handleJoinProject}
            onViewProject={handleViewProject}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            // Pagination props
            totalCount={totalCount}
            pageCount={pageCount}
            currentPage={currentPage}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Box>

        {/* Floating Action Button */}
        <FloatingActionButton onCreateProject={handleCreateProject} />
      </Container>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        open={editDialogOpen}
        project={selectedProject}
        onClose={handleCloseEditDialog}
        onSubmit={handleUpdateProject}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        project={selectedProject}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default Dashboard;
