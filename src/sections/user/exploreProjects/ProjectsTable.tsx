import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  IconButton,
  Tooltip,
  Card,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PATH_USER } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../redux/configStore";
import { joinProjectThunk } from "../../../redux/projects/projectsThunks";
import type { Project } from "../../../common/models/project";

interface ProjectsTableProps {
  projects: Project[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  totalCount,
  pageCount,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get joining state from Redux
  const { isJoining } = useAppSelector((state) => state.projects);

  // Track which project is being joined
  const [joiningProjectId, setJoiningProjectId] = React.useState<string | null>(
    null
  );

  const handleViewProject = (projectId: string) => {
    navigate(PATH_USER.projectDetail(projectId));
  };

  const handleJoinProject = async (projectId: string) => {
    try {
      setJoiningProjectId(projectId);
      await dispatch(
        joinProjectThunk({
          projectId,
          message: "Tôi muốn tham gia dự án này",
        })
      ).unwrap();

      // Success message already shown by toast in slice
    } catch {
      // Error message already shown by toast in slice
    } finally {
      setJoiningProjectId(null);
    }
  };

  // Helper function to get active member count (filter out removed members)
  const getActiveMemberCount = (project: Project): number => {
    if (!project.members || project.members.length === 0) {
      return 1; // At least the owner
    }
    
    // Filter out removed members, same logic as getProjectByIdThunk
    const activeMembers = project.members.filter(
      (member) =>
        !member.isRemoved &&
        member.approvedStatus !== "REMOVED" &&
        member.approvedStatus !== "removed"
    );
    
    return Math.max(activeMembers.length, 1); // At least 1 (owner)
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getStatusColor = (
    status: string
  ): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toLowerCase()) {
      case "active":
      case "đang hoạt động":
        return "success";
      case "completed":
      case "hoàn thành":
        return "primary";
      case "paused":
      case "tạm dừng":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Đang hoạt động";
      case "completed":
        return "Hoàn thành";
      case "paused":
        return "Tạm dừng";
      default:
        return status || "Chưa xác định";
    }
  };

  // Loading skeleton
  if (isLoading && projects.length === 0) {
    return (
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8f9fa", height: 70 }}>
              <TableCell>
                <Skeleton width={200} height={30} />
              </TableCell>
              <TableCell>
                <Skeleton width={300} height={30} />
              </TableCell>
              <TableCell>
                <Skeleton width={120} height={30} />
              </TableCell>
              <TableCell>
                <Skeleton width={140} height={30} />
              </TableCell>
              <TableCell>
                <Skeleton width={120} height={30} />
              </TableCell>
              <TableCell>
                <Skeleton width={150} height={30} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index} sx={{ height: 90 }}>
                <TableCell>
                  <Skeleton width="100%" height={70} />
                </TableCell>
                <TableCell>
                  <Skeleton width="100%" height={50} />
                </TableCell>
                <TableCell>
                  <Skeleton width="100%" height={50} />
                </TableCell>
                <TableCell>
                  <Skeleton width="100%" height={50} />
                </TableCell>
                <TableCell>
                  <Skeleton width="100%" height={50} />
                </TableCell>
                <TableCell>
                  <Skeleton width="100%" height={50} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Empty state
  if (projects.length === 0 && !isLoading) {
    return (
      <Card
        sx={{
          p: 8,
          textAlign: "center",
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "2px dashed rgba(44, 44, 44, 0.1)",
        }}
      >
        <GroupIcon
          sx={{ fontSize: 100, color: "#2C2C2C", mb: 3, opacity: 0.6 }}
        />
        <Typography
          variant="h4"
          sx={{ mb: 2, color: "#2C2C2C", fontWeight: 700 }}
        >
          Không tìm thấy dự án
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: "#666666", mb: 4, maxWidth: 400, mx: "auto" }}
        >
          Hiện tại không có dự án nào phù hợp với tìm kiếm của bạn.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#2C2C2C",
            "&:hover": { bgcolor: "#1A1A1A" },
            textTransform: "none",
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
          onClick={() => navigate(PATH_USER.projectCreate)}
        >
          Tạo dự án mới
        </Button>
      </Card>
    );
  }

  return (
    <Box>
      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          mb: 4,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8f9fa", height: 70 }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#2C2C2C",
                  py: 3,
                  borderBottom: "2px solid #e9ecef",
                }}
              >
                Dự án
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#2C2C2C",
                  py: 3,
                  borderBottom: "2px solid #e9ecef",
                }}
              >
                Thông tin
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#2C2C2C",
                  py: 3,
                  borderBottom: "2px solid #e9ecef",
                }}
              >
                Thành viên
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#2C2C2C",
                  py: 3,
                  borderBottom: "2px solid #e9ecef",
                }}
              >
                Trạng thái
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#2C2C2C",
                  py: 3,
                  borderBottom: "2px solid #e9ecef",
                }}
              >
                Ngày tạo
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#2C2C2C",
                  py: 3,
                  borderBottom: "2px solid #e9ecef",
                }}
              >
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project, index) => (
              <TableRow
                key={project.id}
                sx={{
                  "&:hover": {
                    bgcolor: "rgba(44, 44, 44, 0.03)",
                    cursor: "pointer",
                    transform: "scale(1.005)",
                    transition: "all 0.2s ease-in-out",
                  },
                  "&:last-child td, &:last-child th": { border: 0 },
                  height: 90,
                  borderBottom:
                    index === projects.length - 1
                      ? "none"
                      : "1px solid rgba(0,0,0,0.06)",
                }}
                onClick={() => handleViewProject(project.id)}
              >
                <TableCell sx={{ py: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#2C2C2C",
                        width: 60,
                        height: 60,
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        boxShadow: "0 4px 16px rgba(44, 44, 44, 0.2)",
                      }}
                    >
                      {project.name?.charAt(0)?.toUpperCase() || "P"}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "#2C2C2C",
                          mb: 0.5,
                          fontSize: "1.25rem",
                        }}
                      >
                        {project.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666666",
                          fontWeight: 500,
                          bgcolor: "#f8f9fa",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: "inline-block",
                        }}
                      >
                        ID: {project.id.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell sx={{ maxWidth: "350px", py: 3 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <DescriptionIcon
                      sx={{ color: "#666666", mt: 0.5, fontSize: 20 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#444444",
                        lineHeight: 1.5,
                        fontSize: "1rem",
                      }}
                    >
                      {truncateText(
                        project.description || "Chưa có mô tả cho dự án này"
                      )}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center" sx={{ py: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      bgcolor: "#f8f9fa",
                      borderRadius: 2,
                      py: 1,
                      px: 2,
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 22, color: "#2C2C2C" }} />
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#2C2C2C",
                        fontWeight: 700,
                      }}
                    >
                      {getActiveMemberCount(project)}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center" sx={{ py: 3 }}>
                  <Chip
                    label={getStatusText(project.status || "active")}
                    color={getStatusColor(project.status || "active")}
                    size="medium"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      px: 1,
                      py: 2,
                      borderRadius: 2,
                    }}
                  />
                </TableCell>

                <TableCell align="center" sx={{ py: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      bgcolor: "#f8f9fa",
                      borderRadius: 2,
                      py: 1,
                      px: 2,
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 18, color: "#666666" }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#666666",
                        fontWeight: 500,
                      }}
                    >
                      {formatDate(
                        project.createdAt || new Date().toISOString()
                      )}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center" sx={{ py: 3 }}>
                  <Box
                    sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}
                  >
                    <Tooltip title="Xem chi tiết" placement="top">
                      <IconButton
                        size="large"
                        sx={{
                          color: "#2C2C2C",
                          bgcolor: "#f8f9fa",
                          "&:hover": {
                            bgcolor: "#2C2C2C",
                            color: "white",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProject(project.id);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Tham gia dự án" placement="top">
                      <span>
                        <IconButton
                          size="large"
                          disabled={
                            isJoining && joiningProjectId === project.id
                          }
                          sx={{
                            color: "#4caf50",
                            bgcolor: "rgba(76, 175, 80, 0.1)",
                            "&:hover": {
                              bgcolor: "#4caf50",
                              color: "white",
                              transform: "scale(1.1)",
                            },
                            "&:disabled": {
                              bgcolor: "rgba(76, 175, 80, 0.05)",
                              color: "rgba(76, 175, 80, 0.5)",
                            },
                            transition: "all 0.2s ease-in-out",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinProject(project.id);
                          }}
                        >
                          {isJoining && joiningProjectId === project.id ? (
                            <CircularProgress
                              size={24}
                              sx={{ color: "inherit" }}
                            />
                          ) : (
                            <PersonAddIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Pagination */}
      {(pageCount > 1 || totalCount > pageSize) && (
        <Card
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 3,
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          {/* Page size selector */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body1"
              sx={{ color: "#2C2C2C", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              Hiển thị:
            </Typography>
            <FormControl size="medium" sx={{ minWidth: 100 }}>
              <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                sx={{
                  "& .MuiSelect-select": {
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                  },
                  borderRadius: 2,
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
            <Typography
              variant="body1"
              sx={{ color: "#666666", fontWeight: 500 }}
            >
              dự án/trang
            </Typography>
          </Box>

          {/* Results info */}
          <Typography
            variant="body1"
            sx={{
              color: "#666666",
              fontSize: "1rem",
              fontWeight: 500,
              display: { xs: "none", sm: "block" },
            }}
          >
            Hiển thị {Math.min((currentPage - 1) * pageSize + 1, totalCount)}–
            {Math.min(currentPage * pageSize, totalCount)} của {totalCount} dự
            án
          </Typography>

          {/* Pagination controls */}
          <Pagination
            count={Math.max(pageCount, Math.ceil(totalCount / pageSize))}
            page={currentPage}
            onChange={onPageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            disabled={isLoading}
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "1rem",
                fontWeight: 600,
                minWidth: 40,
                height: 40,
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
        </Card>
      )}
    </Box>
  );
};

export default ProjectsTable;
