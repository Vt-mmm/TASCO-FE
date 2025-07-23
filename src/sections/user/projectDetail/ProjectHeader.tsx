import React from "react";
import {
  Box,
  Typography,
  Button,
  Badge,
  AvatarGroup,
  Avatar,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Assignment,
  Group,
  PersonAdd,
  Add,
  Person,
  ManageAccounts,
} from "@mui/icons-material";
import {
  Project,
  ProjectMember,
  ProjectRequest,
} from "../../../common/models/project";
import { WorkArea } from "../../../common/models/workArea";
import { getApprovedMembers } from "../../../utils/projectUtils";

interface Props {
  project: Project;
  workAreas: WorkArea[];
  projectRequests: ProjectRequest[];
  totalTasks: number;
  completedTasks: number;
  onOpenDialog: () => void;
  onRequestDialogOpen: () => void;
  onManageMembers?: () => void;
}

const ProjectHeader: React.FC<Props> = ({
  project,
  workAreas,
  projectRequests,
  totalTasks,
  completedTasks,
  onOpenDialog,
  onRequestDialogOpen,
  onManageMembers,
}) => {
  // Get member lists
  const approvedMembers = getApprovedMembers(project);
  const memberCount = approvedMembers.length;
  const pendingRequests = projectRequests.filter(
    (r) => r.status === "pending"
  ).length;

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
        borderRadius: 3,
        border: "1px solid #e0e0e0",
        overflow: "hidden",
        mb: 3,
      }}
    >
      {/* Main Header */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Assignment sx={{ fontSize: 28, color: "#1976d2" }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                }}
              >
                {project.name}
              </Typography>
            </Box>

            {project.description && (
              <Typography
                variant="body2"
                sx={{
                  color: "#666666",
                  mb: 2,
                  maxWidth: "80%",
                  lineHeight: 1.5,
                }}
              >
                {project.description}
              </Typography>
            )}
          </Box>

          <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
            {/* Join Requests */}
            <Badge
              badgeContent={pendingRequests}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.7rem",
                  minWidth: "18px",
                  height: "18px",
                },
              }}
            >
              <Button
                startIcon={<PersonAdd />}
                variant="outlined"
                size="small"
                onClick={onRequestDialogOpen}
                sx={{
                  color: "#1976d2",
                  borderColor: "#1976d2",
                  textTransform: "none",
                  fontWeight: 500,
                  px: 2,
                  "&:hover": {
                    borderColor: "#1565c0",
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                  },
                }}
              >
                Requests
              </Button>
            </Badge>

            {/* Manage Members */}
            <Button
              startIcon={<ManageAccounts />}
              variant="outlined"
              size="small"
              onClick={onManageMembers}
              sx={{
                color: "#7c4dff",
                borderColor: "#7c4dff",
                textTransform: "none",
                fontWeight: 500,
                px: 2,
                "&:hover": {
                  borderColor: "#651fff",
                  backgroundColor: "rgba(124, 77, 255, 0.04)",
                },
              }}
            >
              Manage Members
            </Button>

            {/* Add Work Area */}
            <Button
              startIcon={<Add />}
              variant="contained"
              size="small"
              onClick={onOpenDialog}
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Add Work Area
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={2}>
          <Chip
            icon={<Group />}
            label={`${memberCount} Members`}
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              "& .MuiChip-icon": { color: "#6c757d" },
            }}
          />
          <Chip
            label={`${workAreas.length} Work Areas`}
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
            }}
          />
          <Chip
            label={`${completedTasks}/${totalTasks} Tasks`}
            variant="outlined"
            size="small"
            sx={{
              backgroundColor:
                completedTasks === totalTasks ? "#e8f5e8" : "#fff3e0",
              border: `1px solid ${
                completedTasks === totalTasks ? "#c8e6c9" : "#ffcc02"
              }`,
              color: completedTasks === totalTasks ? "#2e7d32" : "#f57c00",
            }}
          />
          {project.createdAt && (
            <Typography variant="caption" sx={{ color: "#9e9e9e", ml: "auto" }}>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </Typography>
          )}
        </Box>

        {/* Members Preview */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
            Team:
          </Typography>
          <AvatarGroup
            max={6}
            sx={{
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                fontSize: "0.8rem",
                border: "2px solid white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              },
            }}
          >
            {approvedMembers
              .slice(0, 6)
              .map((member: ProjectMember, index: number) => (
                <Tooltip key={member.userId} title={`Member ${index + 1}`}>
                  <Avatar
                    sx={{
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                    }}
                  >
                    <Person sx={{ fontSize: 16 }} />
                  </Avatar>
                </Tooltip>
              ))}
          </AvatarGroup>
          {memberCount > 6 && (
            <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
              +{memberCount - 6} more
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectHeader;
