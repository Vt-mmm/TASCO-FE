import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { TaskMember } from "../../../common/models/taskMember";
import { ProjectMember } from "../../../common/models/project";

interface TaskMemberTableProps {
  members: TaskMember[];
  isLoading: boolean;
  totalCount: number;
  currentUserId?: string;
  isTaskOwner: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onEditMember: (member: TaskMember) => void;
  onDeleteMember: (member: TaskMember) => void;
  projectMembers: ProjectMember[];
}

const TaskMemberTable: React.FC<TaskMemberTableProps> = ({
  members,
  isLoading,
  totalCount,
  currentUserId,
  isTaskOwner,
  isUpdating,
  isDeleting,
  onEditMember,
  onDeleteMember,
  projectMembers,
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "error";
      case "ASSIGNEE":
        return "primary";
      case "REVIEWER":
        return "warning";
      case "MEMBER":
      default:
        return "default";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Chủ sở hữu";
      case "ASSIGNEE":
        return "Người thực hiện";
      case "REVIEWER":
        return "Người đánh giá";
      case "MEMBER":
      default:
        return "Thành viên";
    }
  };

  const getDisplayName = (member: TaskMember) => {
    // Tìm thông tin thành viên từ project members để lấy userName thực
    const projectMember = projectMembers.find(
      (pm) => pm.userId === member.userId
    );

    // Ưu tiên userName từ project member data
    if (
      projectMember?.userName &&
      projectMember.userName.trim() &&
      !projectMember.userName.includes("@")
    ) {
      return projectMember.userName;
    }

    // Ưu tiên userName thực từ task member backend
    if (
      member.userName &&
      member.userName.trim() &&
      !member.userName.includes("@")
    ) {
      return member.userName;
    }

    // Fallback về email nếu userName là email
    if (member.userEmail && member.userEmail.trim()) {
      return `User (${member.userEmail})`;
    }

    // Fallback về userName nếu là email
    if (member.userName && member.userName.includes("@")) {
      return `User (${member.userName})`;
    }

    // Cuối cùng fallback về userId
    if (member.userId) {
      return `User ID: ${member.userId.substring(0, 8)}...`;
    }

    return "Unknown User";
  };

  const getDisplayEmail = (member: TaskMember) => {
    // Tìm thông tin thành viên từ project members để lấy userGmail
    const projectMember = projectMembers.find(
      (pm) => pm.userId === member.userId
    );

    // Ưu tiên userGmail từ project member data
    if (
      projectMember?.userGmail &&
      projectMember.userGmail.trim() &&
      projectMember.userGmail.includes("@")
    ) {
      return projectMember.userGmail;
    }

    // Fallback về userEmail từ task member
    if (
      member.userEmail &&
      member.userEmail.trim() &&
      member.userEmail.includes("@")
    ) {
      return member.userEmail;
    }

    // Fallback về userName nếu là email
    if (member.userName && member.userName.includes("@")) {
      return member.userName;
    }

    return "Email không có sẵn";
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên thành viên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Ngày tham gia</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Chưa có thành viên nào
                </TableCell>
              </TableRow>
            ) : (
              members
                .filter((member) => !member.isRemoved)
                .map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {getDisplayName(member)}
                        </Typography>
                        {(!member.userName || !member.userName.trim()) &&
                          (!member.userEmail || !member.userEmail.trim()) && (
                            <Typography
                              variant="caption"
                              color="warning.main"
                              sx={{ display: "block" }}
                            >
                              ⚠️ Thông tin không đầy đủ
                            </Typography>
                          )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getDisplayEmail(member)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleText(member.role)}
                        color={getRoleColor(member.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {member.assignedAt
                        ? new Date(member.assignedAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Invalid Date"}
                    </TableCell>
                    <TableCell align="center">
                      {isTaskOwner ? (
                        <>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => onEditMember(member)}
                              disabled={isUpdating}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              member.userId === currentUserId &&
                              member.role === "OWNER"
                                ? "Chủ sở hữu task không thể tự xóa bản thân"
                                : "Xóa khỏi task"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDeleteMember(member)}
                                disabled={
                                  isDeleting ||
                                  (member.userId === currentUserId &&
                                    member.role === "OWNER")
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      ) : member.userId === currentUserId ? (
                        <Tooltip
                          title={
                            member.role === "OWNER"
                              ? "Chủ sở hữu task không thể tự rời khỏi"
                              : "Rời khỏi task"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDeleteMember(member)}
                              disabled={isDeleting || member.role === "OWNER"}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          Chỉ xem
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" color="text.secondary">
        Tổng số thành viên: {totalCount}
      </Typography>
    </>
  );
};

export default TaskMemberTable;
