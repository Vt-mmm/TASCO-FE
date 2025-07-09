import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/configStore";
import {
  getProjectByIdThunk,
  approveJoinRequestThunk,
  rejectJoinRequestThunk,
  joinProjectThunk,
} from "../../redux/projects/projectsThunks";
import {
  getWorkAreasByProjectThunk,
  createWorkAreaThunk,
  updateWorkAreaThunk,
  deleteWorkAreaThunk,
} from "../../redux/workAreas/workAreasThunks";
import {
  updateWorkTaskThunk,
  deleteWorkTaskThunk,
} from "../../redux/workTasks/workTasksThunks";
import { clearWorkAreasByProject } from "../../redux/workAreas/workAreasSlice";

import {
  CreateWorkAreaRequest,
  UpdateWorkAreaRequest,
  WorkArea,
  WorkTask,
  UpdateWorkTaskRequest,
  TaskObjective,
} from "../../common/models/workArea";
import { getPendingJoinRequests } from "../../utils/projectUtils";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  PersonAdd,
  Lock as LockIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { Header } from "../../layout/components/header";
import { PATH_USER } from "../../routes/paths";
import BoardView from "../../sections/user/projectDetail/BoardView";
import EditWorkAreaDialog from "../../sections/user/projectDetail/EditWorkAreaDialog";
import DeleteWorkAreaConfirmationDialog from "../../sections/user/projectDetail/DeleteWorkAreaConfirmationDialog";
import EditWorkTaskDialog from "../../sections/user/projectDetail/EditWorkTaskDialog";
import DeleteWorkTaskConfirmationDialog from "../../sections/user/projectDetail/DeleteWorkTaskConfirmationDialog";
import CreateObjectiveDialog from "../../sections/user/projectDetail/CreateObjectiveDialog";
import EditObjectiveDialog from "../../sections/user/projectDetail/EditObjectiveDialog";
import TaskDetailDialog from "../../sections/user/projectDetail/TaskDetailDialog";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Local states for better control
  const [projectLoadFailed, setProjectLoadFailed] = useState(false);
  const [workAreasLoadFailed, setWorkAreasLoadFailed] = useState(false);

  // Edit/Delete work area states
  const [editWorkAreaDialogOpen, setEditWorkAreaDialogOpen] = useState(false);
  const [deleteWorkAreaDialogOpen, setDeleteWorkAreaDialogOpen] =
    useState(false);
  const [selectedWorkArea, setSelectedWorkArea] = useState<WorkArea | null>(
    null
  );

  // Edit/Delete work task states
  const [editWorkTaskDialogOpen, setEditWorkTaskDialogOpen] = useState(false);
  const [deleteWorkTaskDialogOpen, setDeleteWorkTaskDialogOpen] =
    useState(false);
  const [selectedWorkTask, setSelectedWorkTask] = useState<WorkTask | null>(
    null
  );

  // Create/Edit task objectives states
  const [createObjectiveDialogOpen, setCreateObjectiveDialogOpen] =
    useState(false);
  const [editObjectiveDialogOpen, setEditObjectiveDialogOpen] = useState(false);
  const [selectedObjectiveWorkTask, setSelectedObjectiveWorkTask] =
    useState<WorkTask | null>(null);
  const [selectedObjective, setSelectedObjective] =
    useState<TaskObjective | null>(null);

  // Task detail dialog states
  const [taskDetailDialogOpen, setTaskDetailDialogOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] =
    useState<WorkTask | null>(null);

  // Redux states
  const {
    currentProject,
    isLoading: projectLoading,
    error: projectError,
  } = useAppSelector((s) => s.projects);

  const {
    workAreasByProject,
    isLoadingByProject,
    isCreating: workAreaCreating,
    error: workAreaError,
  } = useAppSelector((s) => s.workAreas);

  // Get WorkAreas for current project
  const projectWorkAreas = React.useMemo(() => {
    return id ? workAreasByProject[id] || [] : [];
  }, [id, workAreasByProject]);

  const workAreasLoading = React.useMemo(() => {
    return id ? isLoadingByProject[id] || false : false;
  }, [id, isLoadingByProject]);

  // Get current user ID from auth state
  const currentUserId = useAppSelector((s) => s.auth.userAuth?.userId) || "";

  // 🔐 MEMBER AUTHORIZATION LOGIC
  const currentUserMembership = React.useMemo(() => {
    if (!currentProject || !currentUserId) return null;

    return currentProject.members?.find(
      (member) => member.userId === currentUserId
    );
  }, [currentProject, currentUserId]);

  const isApprovedMember = React.useMemo(() => {
    if (!currentUserMembership) return false;

    const status =
      currentUserMembership.approvedStatus || currentUserMembership.status;
    return status === "approved" || status === "APPROVED";
  }, [currentUserMembership]);

  const isPendingMember = React.useMemo(() => {
    if (!currentUserMembership) return false;

    const status =
      currentUserMembership.approvedStatus || currentUserMembership.status;
    return status === "pending" || status === "PENDING";
  }, [currentUserMembership]);

  // const isProjectOwner = React.useMemo(() => {
  //   return currentProject?.ownerId === currentUserId;
  // }, [currentProject, currentUserId]);

  // Remove unused canManageProject for now
  // const canManageProject = React.useMemo(() => {
  //   return (
  //     isProjectOwner ||
  //     (isApprovedMember &&
  //       (currentUserMembership?.role === "admin" ||
  //         currentUserMembership?.role === "ADMIN"))
  //   );
  // }, [isProjectOwner, isApprovedMember, currentUserMembership]);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleJoinProject = async () => {
    if (!id) return;

    try {
      await dispatch(
        joinProjectThunk({
          projectId: id,
          message: "Tôi muốn tham gia dự án này",
        })
      ).unwrap();

      // Success message already shown by toast
      // Refresh project data to get updated member status
      await dispatch(getProjectByIdThunk(id));
    } catch {
      // Error message already shown by toast
    }
  };

  useEffect(() => {
    if (!id) {
      navigate(PATH_USER.dashboard);
      return;
    }

    const initializeProjectData = async () => {
      try {
        setProjectLoadFailed(false);

        // Step 1: Load project basic info first (blocking)
        const projectResult = await dispatch(getProjectByIdThunk(id));

        if (getProjectByIdThunk.fulfilled.match(projectResult)) {
          // Project loaded successfully
        } else {
          throw new Error(
            projectResult.error?.message || "Failed to load project"
          );
        }

        // Step 2: Only load WorkAreas if user is approved member
        // This will be checked after project loads
      } catch {
        setProjectLoadFailed(true);
      }
    };

    initializeProjectData();

    // Cleanup when leaving page
    return () => {
      if (id) {
        dispatch(clearWorkAreasByProject(id));
      }
    };
  }, [dispatch, id, navigate]);

  // Load work areas only for approved members
  useEffect(() => {
    if (!id || !currentProject || !isApprovedMember) return;

    const loadWorkAreas = async () => {
      try {
        setWorkAreasLoadFailed(false);
        const workAreasResult = await dispatch(getWorkAreasByProjectThunk(id));

        if (getWorkAreasByProjectThunk.fulfilled.match(workAreasResult)) {
          // Work areas loaded successfully
        } else {
          setWorkAreasLoadFailed(true);
        }
      } catch {
        setWorkAreasLoadFailed(true);
      }
    };

    loadWorkAreas();
  }, [dispatch, id, currentProject, isApprovedMember]);

  const retryLoadProjectAndWorkAreas = async () => {
    if (!id) return;

    try {
      setProjectLoadFailed(false);

      // Step 1: Load project basic info first (blocking)
      await dispatch(getProjectByIdThunk(id)).unwrap();

      // Step 2: Load WorkAreas only for approved members
      if (isApprovedMember) {
        try {
          setWorkAreasLoadFailed(false);
          await dispatch(getWorkAreasByProjectThunk(id)).unwrap();
        } catch {
          setWorkAreasLoadFailed(true);
        }
      }
    } catch {
      setProjectLoadFailed(true);
    }
  };

  const handleRetryProject = () => {
    retryLoadProjectAndWorkAreas();
  };

  const handleRetryWorkAreas = () => {
    if (id && isApprovedMember) {
      dispatch(getWorkAreasByProjectThunk(id));
    }
  };

  const handleCreateWorkArea = async (workAreaData: CreateWorkAreaRequest) => {
    if (!id) return;

    try {
      await dispatch(createWorkAreaThunk({ projectId: id, workAreaData }));
      // Refresh work areas after creation
      await handleRefreshWorkAreas();
    } catch {
      // Error already handled by toast
    }
  };

  const handleApproveJoinRequest = async (requestId: string) => {
    if (!id || !currentUserId) return;

    try {
      await dispatch(
        approveJoinRequestThunk({
          projectId: id,
          memberId: requestId,
          ownerId: currentUserId,
        })
      ).unwrap();

      // Refresh project data to get updated member status
      await dispatch(getProjectByIdThunk(id));
    } catch {
      // Error already handled by toast
    }
  };

  const handleRejectJoinRequest = async (
    requestId: string,
    reason?: string
  ) => {
    if (!id || !currentUserId) return;

    try {
      await dispatch(
        rejectJoinRequestThunk({
          projectId: id,
          memberId: requestId,
          ownerId: currentUserId,
          reason,
        })
      ).unwrap();

      // Refresh project data to get updated member status
      await dispatch(getProjectByIdThunk(id));
    } catch {
      // Error already handled by toast
    }
  };

  const handleRefreshWorkAreas = async () => {
    if (id) {
      await dispatch(getWorkAreasByProjectThunk(id));
    }
  };

  const handleEditWorkArea = (workArea: WorkArea) => {
    setSelectedWorkArea(workArea);
    setEditWorkAreaDialogOpen(true);
  };

  const handleDeleteWorkArea = (workArea: WorkArea) => {
    setSelectedWorkArea(workArea);
    setDeleteWorkAreaDialogOpen(true);
  };

  const handleUpdateWorkArea = async (workAreaData: UpdateWorkAreaRequest) => {
    if (!id || !selectedWorkArea) return;

    try {
      await dispatch(
        updateWorkAreaThunk({
          projectId: id,
          workAreaId: selectedWorkArea.id,
          workAreaData,
        })
      ).unwrap();

      // Refresh work areas to get updated data
      await dispatch(getWorkAreasByProjectThunk(id));
      setEditWorkAreaDialogOpen(false);
      setSelectedWorkArea(null);
    } catch {
      // Error already handled by toast
    }
  };

  const handleConfirmDeleteWorkArea = async () => {
    if (!id || !selectedWorkArea) return;

    try {
      await dispatch(
        deleteWorkAreaThunk({
          projectId: id,
          workAreaId: selectedWorkArea.id,
        })
      ).unwrap();

      // Refresh work areas to get updated data
      await dispatch(getWorkAreasByProjectThunk(id));
      setDeleteWorkAreaDialogOpen(false);
      setSelectedWorkArea(null);
    } catch {
      // Error already handled by toast
    }
  };

  const handleCloseEditWorkAreaDialog = () => {
    setEditWorkAreaDialogOpen(false);
    setSelectedWorkArea(null);
  };

  const handleCloseDeleteWorkAreaDialog = () => {
    setDeleteWorkAreaDialogOpen(false);
    setSelectedWorkArea(null);
  };

  // Work Task handlers
  const handleEditWorkTask = (workTask: WorkTask) => {
    setSelectedWorkTask(workTask);
    setEditWorkTaskDialogOpen(true);
  };

  const handleDeleteWorkTask = (workTask: WorkTask) => {
    setSelectedWorkTask(workTask);
    setDeleteWorkTaskDialogOpen(true);
  };

  const handleUpdateWorkTask = async (workTaskData: UpdateWorkTaskRequest) => {
    if (!selectedWorkTask || !id) return;

    // Use workAreaId from selectedWorkTask, or find it from workAreas if missing
    let workAreaId = selectedWorkTask.workAreaId;
    if (!workAreaId) {
      // Try to find workAreaId by searching through workAreas
      const workArea = projectWorkAreas.find((wa: WorkArea) =>
        wa.workTasks?.some((task: WorkTask) => task.id === selectedWorkTask.id)
      );
      workAreaId = workArea?.id || "";
    }

    if (!workAreaId) {
      return;
    }

    try {
      await dispatch(
        updateWorkTaskThunk({
          workAreaId: workAreaId,
          workTaskId: selectedWorkTask.id,
          workTaskData: workTaskData,
        })
      ).unwrap();

      // Refresh work areas to get updated data
      await dispatch(getWorkAreasByProjectThunk(id));
      setEditWorkTaskDialogOpen(false);
      setSelectedWorkTask(null);
    } catch {
      // Error already handled by toast
    }
  };

  const handleConfirmDeleteWorkTask = async () => {
    if (!selectedWorkTask || !id) return;

    // Use workAreaId from selectedWorkTask, or find it from workAreas if missing
    let workAreaId = selectedWorkTask.workAreaId;
    if (!workAreaId) {
      // Try to find workAreaId by searching through workAreas
      const workArea = projectWorkAreas.find((wa: WorkArea) =>
        wa.workTasks?.some((task: WorkTask) => task.id === selectedWorkTask.id)
      );
      workAreaId = workArea?.id || "";
    }

    if (!workAreaId) {
      return;
    }

    try {
      await dispatch(
        deleteWorkTaskThunk({
          workAreaId: workAreaId,
          workTaskId: selectedWorkTask.id,
        })
      ).unwrap();

      // Refresh work areas to get updated data
      await dispatch(getWorkAreasByProjectThunk(id));
      setDeleteWorkTaskDialogOpen(false);
      setSelectedWorkTask(null);
    } catch {
      // Error already handled by toast
    }
  };

  const handleCloseEditWorkTaskDialog = () => {
    setEditWorkTaskDialogOpen(false);
    setSelectedWorkTask(null);
  };

  const handleCloseDeleteWorkTaskDialog = () => {
    setDeleteWorkTaskDialogOpen(false);
    setSelectedWorkTask(null);
  };

  // Task Objectives handlers
  const handleCreateObjective = (workTask: WorkTask) => {
    setSelectedObjectiveWorkTask(workTask);
    setCreateObjectiveDialogOpen(true);
  };

  const handleEditObjective = (objective: TaskObjective) => {
    setSelectedObjective(objective);
    setEditObjectiveDialogOpen(true);
  };

  const handleCloseCreateObjectiveDialog = () => {
    setCreateObjectiveDialogOpen(false);
    setSelectedObjectiveWorkTask(null);
  };

  const handleCloseEditObjectiveDialog = () => {
    setEditObjectiveDialogOpen(false);
    setSelectedObjective(null);
  };

  const handleObjectiveSuccess = () => {
    // Refresh work areas to get updated objectives count
    if (id) {
      dispatch(getWorkAreasByProjectThunk(id));
    }
  };

  // Task Detail handlers
  const handleViewTaskDetails = (task: WorkTask) => {
    setSelectedTaskForDetail(task);
    setTaskDetailDialogOpen(true);
  };

  const handleCloseTaskDetailDialog = () => {
    setTaskDetailDialogOpen(false);
    setSelectedTaskForDetail(null);
  };

  const handleEditTaskFromDetail = (task: WorkTask) => {
    // Close task detail dialog and open edit dialog
    handleCloseTaskDetailDialog();
    handleEditWorkTask(task);
  };

  // 🚫 NON-MEMBER VIEW COMPONENT
  const NonMemberView = () => {
    if (!currentProject) return null;

    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 6, textAlign: "center" }}>
            <LockIcon
              sx={{
                fontSize: 80,
                color: "#ff9800",
                mb: 3,
                opacity: 0.8,
              }}
            />

            <Typography
              variant="h3"
              sx={{
                mb: 2,
                color: "#2C2C2C",
                fontWeight: 700,
              }}
            >
              {currentProject.name}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "#666666",
                mb: 4,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              {currentProject.description || "Chưa có mô tả cho dự án này"}
            </Typography>

            {/* Project Info Cards */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                mb: 6,
                flexWrap: "wrap",
              }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  minWidth: 200,
                  border: "1px solid #e9ecef",
                }}
              >
                <GroupIcon sx={{ fontSize: 40, color: "#2C2C2C", mb: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#2C2C2C" }}
                >
                  {currentProject.members?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666666" }}>
                  Thành viên
                </Typography>
              </Paper>

              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  minWidth: 200,
                  border: "1px solid #e9ecef",
                }}
              >
                <CalendarIcon sx={{ fontSize: 40, color: "#2C2C2C", mb: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#2C2C2C" }}
                >
                  {formatDate(currentProject.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666666" }}>
                  Ngày tạo
                </Typography>
              </Paper>

              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  minWidth: 200,
                  border: "1px solid #e9ecef",
                }}
              >
                <Chip
                  label={
                    currentProject.status === "active"
                      ? "Đang hoạt động"
                      : currentProject.status
                  }
                  color={
                    currentProject.status === "active" ? "success" : "default"
                  }
                  size="medium"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                  }}
                />
                <Typography variant="body2" sx={{ color: "#666666", mt: 1 }}>
                  Trạng thái
                </Typography>
              </Paper>
            </Box>

            {/* Status-based Action */}
            {isPendingMember ? (
              <Box>
                <Alert
                  severity="info"
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    fontSize: "1.1rem",
                    "& .MuiAlert-message": {
                      fontSize: "1.1rem",
                    },
                  }}
                >
                  🕐 Yêu cầu tham gia của bạn đang được xem xét
                </Alert>
                <Typography variant="body1" sx={{ color: "#666666" }}>
                  Vui lòng chờ quản trị viên dự án phê duyệt yêu cầu của bạn.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: "#2C2C2C",
                    fontWeight: 600,
                  }}
                >
                  🔒 Bạn chưa tham gia dự án này
                </Typography>
                <Typography variant="body1" sx={{ color: "#666666", mb: 4 }}>
                  Tham gia dự án để xem chi tiết các khu vực làm việc, nhiệm vụ
                  và cộng tác với nhóm.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={handleJoinProject}
                  sx={{
                    bgcolor: "#4caf50",
                    "&:hover": { bgcolor: "#45a049" },
                    textTransform: "none",
                    borderRadius: 3,
                    px: 4,
                    py: 2,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)",
                  }}
                >
                  Tham gia dự án
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    );
  };

  // Loading state
  if (projectLoading && !currentProject) {
    return (
      <Box
        sx={{
          backgroundColor: "#F5F0E8", // Cream background like HomePage theme
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#2C2C2C" }} />
      </Box>
    );
  }

  // Project loading failed
  if (projectLoadFailed) {
    return (
      <Box
        sx={{
          backgroundColor: "#F5F0E8", // Cream background like HomePage theme
          minHeight: "100vh",
        }}
      >
        <Header />
        <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(PATH_USER.dashboard)}
              sx={{
                color: "#2C2C2C", // Dark color like HomePage
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#E8DDD0", // Cream hover like HomePage
                },
              }}
            >
              Back to Dashboard
            </Button>
          </Box>

          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: "#FFF2F2", // Light error background
              color: "#D32F2F",
              border: "1px solid #FFCDD2",
              borderRadius: 2,
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRetryProject}
                sx={{ fontWeight: 600 }}
              >
                Retry
              </Button>
            }
          >
            {projectError || "Failed to load project. Please try again."}
          </Alert>
        </Container>
      </Box>
    );
  }

  // Project not found
  if (!currentProject) {
    return (
      <Box
        sx={{
          backgroundColor: "#F5F0E8", // Cream background like HomePage theme
          minHeight: "100vh",
        }}
      >
        <Header />
        <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(PATH_USER.dashboard)}
              sx={{
                color: "#2C2C2C", // Dark color like HomePage
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#E8DDD0", // Cream hover like HomePage
                },
              }}
            >
              Back to Dashboard
            </Button>
          </Box>

          <Alert
            severity="warning"
            sx={{
              mb: 3,
              backgroundColor: "#FFF8E1", // Light warning background
              color: "#F57C00",
              border: "1px solid #FFE0B2",
              borderRadius: 2,
            }}
          >
            Project not found.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#F5F0E8", // Cream background like HomePage theme
        minHeight: "100vh",
      }}
    >
      <Header />

      {/* Back Button */}
      <Container maxWidth="xl" sx={{ py: 2, mt: 8 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(PATH_USER.dashboard)}
          sx={{
            color: "#2C2C2C", // Dark color like HomePage
            fontWeight: 500,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#E8DDD0", // Cream hover like HomePage
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Container>

      {/* 🔐 CONDITIONAL RENDERING BASED ON MEMBERSHIP */}
      {!isApprovedMember ? (
        <NonMemberView />
      ) : (
        <Container maxWidth="xl" sx={{ py: 2, pb: 4 }}>
          {/* Integrated Project Board - Only for approved members */}
          <BoardView
            project={currentProject}
            workAreas={projectWorkAreas}
            projectRequests={getPendingJoinRequests(currentProject)}
            isLoading={workAreasLoading}
            error={
              workAreasLoadFailed
                ? workAreaError || "Failed to load work areas"
                : null
            }
            onRetry={handleRetryWorkAreas}
            onCreateWorkArea={handleCreateWorkArea}
            onApproveRequest={handleApproveJoinRequest}
            onRejectRequest={handleRejectJoinRequest}
            isCreating={workAreaCreating}
            onRefreshWorkAreas={handleRefreshWorkAreas}
            onEditWorkArea={handleEditWorkArea}
            onDeleteWorkArea={handleDeleteWorkArea}
            onEditWorkTask={handleEditWorkTask}
            onDeleteWorkTask={handleDeleteWorkTask}
            onCreateObjective={handleCreateObjective}
            onEditObjective={handleEditObjective}
            onViewTaskDetails={handleViewTaskDetails}
          />

          {/* Edit Work Area Dialog */}
          <EditWorkAreaDialog
            open={editWorkAreaDialogOpen}
            workArea={selectedWorkArea}
            onClose={handleCloseEditWorkAreaDialog}
            onSubmit={handleUpdateWorkArea}
            isLoading={workAreaCreating}
          />

          {/* Delete Work Area Confirmation Dialog */}
          <DeleteWorkAreaConfirmationDialog
            open={deleteWorkAreaDialogOpen}
            workArea={selectedWorkArea}
            onClose={handleCloseDeleteWorkAreaDialog}
            onConfirm={handleConfirmDeleteWorkArea}
            isLoading={workAreaCreating}
          />

          {/* Edit Work Task Dialog */}
          <EditWorkTaskDialog
            open={editWorkTaskDialogOpen}
            workTask={selectedWorkTask}
            onClose={handleCloseEditWorkTaskDialog}
            onSubmit={handleUpdateWorkTask}
            isLoading={workAreaCreating}
          />

          {/* Delete Work Task Confirmation Dialog */}
          <DeleteWorkTaskConfirmationDialog
            open={deleteWorkTaskDialogOpen}
            workTask={selectedWorkTask}
            onClose={handleCloseDeleteWorkTaskDialog}
            onConfirm={handleConfirmDeleteWorkTask}
            isLoading={workAreaCreating}
          />

          {/* Create Task Objective Dialog */}
          <CreateObjectiveDialog
            open={createObjectiveDialogOpen}
            workTask={selectedObjectiveWorkTask}
            onClose={handleCloseCreateObjectiveDialog}
            onSuccess={handleObjectiveSuccess}
          />

          {/* Edit Task Objective Dialog */}
          <EditObjectiveDialog
            open={editObjectiveDialogOpen}
            objective={selectedObjective}
            onClose={handleCloseEditObjectiveDialog}
            onSuccess={handleObjectiveSuccess}
          />

          {/* Task Detail Dialog */}
          <TaskDetailDialog
            open={taskDetailDialogOpen}
            task={selectedTaskForDetail}
            onClose={handleCloseTaskDetailDialog}
            onEditTask={handleEditTaskFromDetail}
          />

          {/* Manage Members Dialog - Temporarily commented out due to props mismatch */}
          {/* <ManageMembersDialog
            open={manageMembersDialogOpen}
            project={currentProject}
            onClose={handleCloseMembersDialog}
            onRemoveMember={handleRemoveMember}
          /> */}
        </Container>
      )}
    </Box>
  );
}
