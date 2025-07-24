import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../redux/configStore";
import {
  getTaskMembersByTaskIdThunk,
  createTaskMemberThunk,
  updateTaskMemberThunk,
  deleteTaskMemberThunk,
  // removeTaskMemberThunk, // Removed - only use hard delete now
} from "../../../redux/taskMembers/taskMembersThunks";
import {
  clearError,
  clearCurrentMember,
} from "../../../redux/taskMembers/taskMembersSlice";
import { getUserInfoThunk } from "../../../redux/auth/authThunks";
import {
  TaskMember,
  CreateTaskMemberRequest,
  UpdateTaskMemberRequest,
} from "../../../common/models/taskMember";
import TaskMemberHeader from "./TaskMemberHeader";
import TaskMemberTable from "./TaskMemberTable";
import TaskMemberDialogs from "./TaskMemberDialogs";
import TaskMemberDeleteDialog from "./TaskMemberDeleteDialog";

interface TaskMemberManagerProps {
  workTaskId: string;
  taskName?: string;
  currentUserProjectRole?: string; // Add project role to determine task permissions
  projectId?: string; // Add project ID to fetch project members
}

const TaskMemberManager: React.FC<TaskMemberManagerProps> = ({
  workTaskId,
  taskName,
  currentUserProjectRole,
  projectId = "",
}) => {
  const dispatch = useAppDispatch();
  const {
    members,
    totalCount,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createError,
    updateError,
    deleteError,
  } = useAppSelector((state) => state.taskMembers);

  // Get current user info from auth state
  const { userInfo, accountInfo } = useAppSelector((state) => state.auth);

  // Get current project to access member info
  const currentProject = useAppSelector(
    (state) => state.projects.currentProject
  );

  // Use accountInfo if userInfo is null
  const currentUser = userInfo || accountInfo;
  const currentUserId =
    userInfo?.accountId?.toString() || accountInfo?.userId?.toString();

  // Check if current user is owner of the task - use useMemo to recalculate when members change
  const { isTaskOwner, isCurrentUserInTask } = useMemo(() => {
    const memberFound = members.find(
      (member) => member.userId === currentUserId && !member.isRemoved
    );

    // Logic: PROJECT OWNER có quyền quản lý task như TASK OWNER
    const isProjectOwner = currentUserProjectRole?.toUpperCase() === "OWNER";
    const isTaskMemberOwner = memberFound?.role === "OWNER";

    // User is task owner if:
    // 1. They are PROJECT OWNER (can manage all tasks in project), OR
    // 2. They are explicitly TASK OWNER
    const isOwner = isProjectOwner || isTaskMemberOwner;
    const isInTask = !!memberFound;

    return {
      isTaskOwner: isOwner,
      isCurrentUserInTask: isInTask,
    };
  }, [members, currentUserId, currentUserProjectRole]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TaskMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TaskMember | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateTaskMemberRequest>({
    userId: "",
    userName: "",
    userEmail: "",
    role: "MEMBER",
  });

  useEffect(() => {
    // Load user info if not available
    if (!userInfo && !accountInfo) {
      dispatch(getUserInfoThunk());
    }
  }, [dispatch, userInfo, accountInfo]);

  useEffect(() => {
    if (workTaskId) {
      dispatch(getTaskMembersByTaskIdThunk({ workTaskId }));
    }
  }, [dispatch, workTaskId]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearCurrentMember());
    };
  }, [dispatch]);

  const handleAddMember = async () => {
    if (!formData.userId || !formData.userName) {
      return;
    }

    try {
      await dispatch(
        createTaskMemberThunk({
          workTaskId,
          memberData: formData,
        })
      ).unwrap();

      // Refresh data after successful creation
      dispatch(getTaskMembersByTaskIdThunk({ workTaskId }));

      // Show success message
      toast.success(`Đã thêm thành viên "${formData.userName}" thành công!`);

      setOpenAddDialog(false);
      setFormData({
        userId: "",
        userName: "",
        userEmail: "",
        role: "MEMBER",
      });
    } catch {
      // Error handled by Redux
      toast.error("Không thể thêm thành viên. Vui lòng thử lại!");
    }
  };

  const handleEditMember = async () => {
    if (!editingMember || !formData.userId || !formData.userName) {
      return;
    }

    try {
      await dispatch(
        updateTaskMemberThunk({
          workTaskId,
          memberId: editingMember.id,
          memberData: formData as UpdateTaskMemberRequest,
        })
      ).unwrap();

      // Refresh data after successful update
      dispatch(getTaskMembersByTaskIdThunk({ workTaskId }));

      // Show success message
      toast.success(
        `Đã cập nhật thông tin thành viên "${formData.userName}" thành công!`
      );

      setOpenEditDialog(false);
      setEditingMember(null);
      setFormData({
        userId: "",
        userName: "",
        userEmail: "",
        role: "MEMBER",
      });
    } catch {
      // Error handled by Redux
      toast.error("Không thể cập nhật thông tin thành viên. Vui lòng thử lại!");
    }
  };

  const handleDeleteMember = async (member: TaskMember) => {
    // Prevent OWNER from removing themselves or being removed
    if (member.role === "OWNER") {
      setDeletingMember(member);
      setOpenDeleteDialog(true);
      return; // Show blocked dialog
    }

    setDeletingMember(member);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteMember = async () => {
    if (!deletingMember) return;

    // Block deletion if member is OWNER
    if (deletingMember.role === "OWNER") {
      toast.error("Không thể xóa chủ sở hữu task. Hãy thay đổi vai trò trước!");
      return;
    }

    const isCurrentUser = deletingMember.userId === currentUserId;
    const actionText = isCurrentUser ? "rời khỏi task" : "xóa khỏi task";

    try {
      await dispatch(
        deleteTaskMemberThunk({
          workTaskId,
          memberId: deletingMember.id,
        })
      ).unwrap();

      // Refresh task members data after successful delete
      dispatch(getTaskMembersByTaskIdThunk({ workTaskId }));

      // Show success message
      toast.success(
        isCurrentUser
          ? "Bạn đã rời khỏi task thành công! Bạn có thể tham gia lại bất cứ lúc nào."
          : `Đã xóa thành viên "${deletingMember.userName}" khỏi task thành công!`
      );

      // Close dialog and reset state
      setOpenDeleteDialog(false);
      setDeletingMember(null);
    } catch {
      // Show error message
      toast.error(`Không thể ${actionText}. Vui lòng thử lại!`);
      // Keep dialog open to allow retry
    }
  };

  const cancelDeleteMember = () => {
    setOpenDeleteDialog(false);
    setDeletingMember(null);
  };

  const handleJoinTask = async () => {
    if (!currentUser) {
      return;
    }

    // Get current user info from project members to get real userName
    const projectMember = currentProject?.members?.find(
      (member) => member.userId === currentUserId
    );

    const joinData: CreateTaskMemberRequest = {
      userId: currentUserId || "",
      userName:
        projectMember?.userName || currentUser.fullName || "Unknown User",
      userEmail:
        projectMember?.userGmail ||
        projectMember?.userEmail ||
        currentUser.email ||
        "",
      role: "MEMBER", // Default role when joining
    };

    try {
      await dispatch(
        createTaskMemberThunk({
          workTaskId,
          memberData: joinData,
        })
      ).unwrap();

      // Refresh data after successful join
      dispatch(getTaskMembersByTaskIdThunk({ workTaskId }));

      // Show success message
      toast.success("Bạn đã tham gia task thành công!");
    } catch {
      // Error handled by Redux
      toast.error("Không thể tham gia task. Vui lòng thử lại!");
    }
  };

  const openEditMemberDialog = (member: TaskMember) => {
    setEditingMember(member);
    setFormData({
      userId: member.userId,
      userName: member.userName,
      userEmail: member.userEmail,
      role: member.role,
    });
    setOpenEditDialog(true);
  };

  return (
    <Card>
      <CardContent>
        <TaskMemberHeader
          taskName={taskName}
          isTaskOwner={isTaskOwner}
          isCurrentUserInTask={isCurrentUserInTask}
          currentUser={currentUser}
          isCreating={isCreating}
          onAddMember={() => setOpenAddDialog(true)}
          onJoinTask={handleJoinTask}
        />

        {/* Error Display */}
        {(error || createError || updateError || deleteError) && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error" variant="body2">
              {error || createError || updateError || deleteError}
            </Typography>
          </Box>
        )}

        {/* Members Table */}
        <TaskMemberTable
          members={members}
          totalCount={totalCount}
          isLoading={isLoading}
          isTaskOwner={isTaskOwner}
          currentUserId={currentUserId}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          onEditMember={openEditMemberDialog}
          onDeleteMember={handleDeleteMember}
          projectMembers={currentProject?.members || []}
        />
      </CardContent>

      <TaskMemberDialogs
        isTaskOwner={isTaskOwner}
        openAddDialog={openAddDialog}
        openEditDialog={openEditDialog}
        formData={formData}
        isCreating={isCreating}
        isUpdating={isUpdating}
        onCloseAddDialog={() => setOpenAddDialog(false)}
        onCloseEditDialog={() => setOpenEditDialog(false)}
        onFormDataChange={setFormData}
        onAddMember={handleAddMember}
        onEditMember={handleEditMember}
        projectId={projectId}
        excludeUserIds={members
          .filter((m) => !m.isRemoved)
          .map((m) => m.userId)}
      />

      <TaskMemberDeleteDialog
        open={openDeleteDialog}
        member={deletingMember}
        isCurrentUser={deletingMember?.userId === currentUserId}
        isDeleting={isDeleting}
        onClose={cancelDeleteMember}
        onConfirm={confirmDeleteMember}
      />
    </Card>
  );
};

export default TaskMemberManager;
