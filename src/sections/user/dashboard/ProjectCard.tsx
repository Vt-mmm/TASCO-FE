import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Stack,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PATH_USER } from "../../../routes/paths";
import type { Project } from "../../../common/models/project";

interface ProjectCardProps {
  project: Project;
  currentUserId?: string;
  onJoinProject: (projectId: string) => Promise<void>;
  onViewProject: (projectId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  currentUserId,
  onJoinProject,
  onViewProject,
  onEditProject,
  onDeleteProject,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [preventCardClick, setPreventCardClick] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const isUserInProject = () => {
    return project.members.some(
      (member) =>
        member.userId === currentUserId &&
        (member.approvedStatus === "approved" ||
          member.approvedStatus === "APPROVED" ||
          member.role === "owner" ||
          member.role === "OWNER")
    );
  };

  const isUserPendingInProject = () => {
    return project.members.some(
      (member) =>
        member.userId === currentUserId &&
        (member.approvedStatus === "pending" ||
          member.approvedStatus === "PENDING")
    );
  };

  const getApprovedMembersCount = () => {
    return project.members.filter(
      (member) =>
        member.approvedStatus === "approved" ||
        member.approvedStatus === "APPROVED" ||
        member.role === "owner" ||
        member.role === "OWNER"
    ).length;
  };

  const isUserOwner = () => {
    return project.members.some(
      (member) =>
        member.userId === currentUserId &&
        (member.role === "owner" || member.role === "OWNER")
    );
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Reset prevent flag after a short delay
    setTimeout(() => setPreventCardClick(false), 100);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setPreventCardClick(true);
    onEditProject(project);
    handleMenuClose();
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setPreventCardClick(true);
    onDeleteProject(project);
    handleMenuClose();
  };

  const handleCardClick = () => {
    if (preventCardClick) {
      return;
    }
    onViewProject(project.id);
  };

  return (
    <Card
      sx={{
        width: { xs: "100%", sm: "48%", md: "31%" },
        cursor: "pointer",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(44, 44, 44, 0.08)",
        border: "1px solid rgba(44, 44, 44, 0.1)",
        transition: "all 0.25s ease-in-out",
        background: "white",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(44, 44, 44, 0.12)",
          borderColor: "rgba(44, 44, 44, 0.2)",
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              flexGrow: 1,
              color: "#2C2C2C",
            }}
          >
            {project.name}
          </Typography>
          {isUserOwner() && (
            <>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  color: "#666666",
                  "&:hover": {
                    color: "#2C2C2C",
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    mt: 1,
                    boxShadow: "0 4px 16px rgba(44, 44, 44, 0.12)",
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={(e) => handleEdit(e)}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit Project</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={(e) => handleDelete(e)}
                  sx={{ color: "#F44336" }}
                >
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" sx={{ color: "#F44336" }} />
                  </ListItemIcon>
                  <ListItemText>Delete Project</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: "#666666",
          }}
        >
          {project.description || "No description provided"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {isUserInProject() && (
              <Chip
                label="Member"
                size="small"
                sx={{
                  fontSize: "0.7rem",
                  bgcolor: "#E8DDD0",
                  color: "#2C2C2C",
                  fontWeight: 500,
                }}
              />
            )}
            <PeopleIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ color: "#666666" }}>
              {getApprovedMembersCount()}
            </Typography>
          </Stack>
        </Box>

        {/* Progress bar */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: "#666666" }}>
              Progress
            </Typography>
            <Typography variant="body2" sx={{ color: "#666666" }}>
              {project.progress || 0}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 4,
              bgcolor: "#E8DDD0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                bgcolor: "#2C2C2C",
                width: `${project.progress || 0}%`,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>

        {/* Members avatars */}
        <Stack direction="row" spacing={1}>
          {project.members
            .filter(
              (member) =>
                member.approvedStatus === "approved" ||
                member.approvedStatus === "APPROVED" ||
                member.role === "owner" ||
                member.role === "OWNER"
            )
            .slice(0, 3)
            .map((member) => (
              <Avatar
                key={member.id || member.userId}
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: "0.75rem",
                  bgcolor: "#D4C4B0",
                  color: "#2C2C2C",
                }}
              >
                {member.userId?.charAt(0).toUpperCase() || "U"}
              </Avatar>
            ))}
          {getApprovedMembersCount() > 3 && (
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: "0.75rem",
                bgcolor: "#D4C4B0",
                color: "#2C2C2C",
              }}
            >
              +{getApprovedMembersCount() - 3}
            </Avatar>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onViewProject(project.id);
          }}
          sx={{
            color: "#666666",
            textTransform: "none",
            "&:hover": {
              bgcolor: "rgba(44, 44, 44, 0.04)",
              color: "#2C2C2C",
            },
          }}
        >
          View Details
        </Button>
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            navigate(PATH_USER.projectDetail(project.id));
          }}
          sx={{
            color: "#2C2C2C",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              bgcolor: "rgba(44, 44, 44, 0.08)",
            },
          }}
        >
          Manage Tasks
        </Button>
        {!isUserInProject() && !isUserPendingInProject() && (
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              onJoinProject(project.id);
            }}
            sx={{
              ml: "auto",
              borderColor: "#2C2C2C",
              color: "#2C2C2C",
              textTransform: "none",
              "&:hover": {
                borderColor: "#2C2C2C",
                bgcolor: "rgba(44, 44, 44, 0.04)",
              },
            }}
          >
            Join Project
          </Button>
        )}
        {isUserPendingInProject() && (
          <Button
            size="small"
            variant="outlined"
            disabled
            sx={{
              ml: "auto",
              borderColor: "#E8DDD0",
              color: "#666666",
              textTransform: "none",
            }}
          >
            Pending Approval
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
