import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { People, PersonRemove, Close, AdminPanelSettings, Star, Person } from "@mui/icons-material";
import { ProjectMember } from "../../../common/models/project";
import {
  getUserDisplayName,
  isCurrentUser as checkIsCurrentUser,
} from "../../../utils/userService";
import RemoveMemberConfirmDialog from "./RemoveMemberConfirmDialog";

interface Props {
  open: boolean;
  onClose: () => void;
  members: ProjectMember[];
  pendingMembers: ProjectMember[];
  currentUserId: string;
  onRemoveMember: (memberId: string) => Promise<void>;
  isRemovingMember?: boolean;
}

const ManageMembersDialog: React.FC<Props> = ({
  open,
  onClose,
  members,
  pendingMembers,
  currentUserId,
  onRemoveMember,
  isRemovingMember = false,
}) => {
  const [memberDisplayNames, setMemberDisplayNames] = useState<
    Map<string, string>
  >(new Map());
  const [currentUserFlags, setCurrentUserFlags] = useState<
    Map<string, boolean>
  >(new Map());

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Debug: Log when members prop changes
  useEffect(() => {
    // Members prop changed - component will re-render automatically
  }, [members]);

  useEffect(() => {
    const loadUserDisplayNames = async () => {
      if (!open) {
        // Clear display names when dialog is closed to prevent stale data
        setMemberDisplayNames(new Map());
        setCurrentUserFlags(new Map());
        return;
      }

      const allMembers = [...members, ...pendingMembers];
      const displayNames = new Map<string, string>();
      const userFlags = new Map<string, boolean>();

      // Load display names và current user flags cho tất cả members
      await Promise.all(
        allMembers.map(async (member) => {
          const displayName = await getUserDisplayName(
            member.userId,
            member.userName
          );
          const isCurrentUserFlag = await checkIsCurrentUser(member.userId);

          displayNames.set(member.userId, displayName);
          userFlags.set(member.userId, isCurrentUserFlag);
        })
      );

      setMemberDisplayNames(displayNames);
      setCurrentUserFlags(userFlags);
    };

    loadUserDisplayNames();
  }, [open, members, pendingMembers]);

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "owner":
        return "error";
      case "admin":
        return "warning";
      case "member":
        return "primary";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "owner":
        return <Star sx={{ fontSize: 16 }} />;
      case "admin":
        return <AdminPanelSettings sx={{ fontSize: 16 }} />;
      case "member":
        return <Person sx={{ fontSize: 16 }} />;
      default:
        return <Person sx={{ fontSize: 16 }} />;
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "#f44336", "#e91e63", "#9c27b0", "#673ab7",
      "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
      "#009688", "#4caf50", "#8bc34a", "#cddc39",
      "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
    ];
    
    const index = name.length % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canRemoveMember = (member: ProjectMember): boolean => {
    // Không thể xóa owner
    if (member.role?.toLowerCase() === "owner") return false;
    // Không thể xóa chính mình
    if (member.userId === currentUserId) return false;
    return true;
  };

  const handleRemoveClick = (member: ProjectMember) => {
    const memberName =
      memberDisplayNames.get(member.userId) || member.userName || member.userId;

    // Use member.id if available, otherwise use member.userId
    // But we need to make sure we're consistent with what the API expects
    const memberIdToRemove = member.id || member.userId;

    setMemberToRemove({
      id: memberIdToRemove,
      name: memberName,
    });
    setConfirmDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (memberToRemove) {
      await onRemoveMember(memberToRemove.id);

      setConfirmDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setConfirmDialogOpen(false);
    setMemberToRemove(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(44, 44, 44, 0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{ pb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <People sx={{ color: "#7c4dff" }} />
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: 600, color: "#2C2C2C" }}
        >
          Manage Members
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {/* Team Members Section */}
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "#1976d2", fontWeight: 600 }}
        >
          Team Members ({members.length})
        </Typography>

        {members.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
              color: "#999999",
            }}
          >
            <People sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" textAlign="center">
              No approved members found
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0, mb: 3 }}>
            {members.map((member) => {
              const memberName = memberDisplayNames.get(member.userId) || "Loading...";
              const isCurrentUser = currentUserFlags.get(member.userId);
              
              return (
                <ListItem
                  key={member.id || member.userId}
                  sx={{
                    border: "1px solid rgba(44, 44, 44, 0.1)",
                    borderRadius: 3,
                    mb: 2,
                    p: 2.5,
                    backgroundColor: isCurrentUser ? "#f8f9ff" : "#ffffff",
                    borderColor: isCurrentUser ? "#e3f2fd" : "rgba(44, 44, 44, 0.1)",
                    "&:last-child": { mb: 0 },
                    "&:hover": {
                      backgroundColor: isCurrentUser ? "#f0f4ff" : "#fafafa",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(44, 44, 44, 0.08)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      bgcolor: getAvatarColor(memberName),
                      width: 48,
                      height: 48,
                      mr: 2,
                      fontWeight: 600,
                      fontSize: "1.1rem",
                    }}
                  >
                    {getInitials(memberName)}
                  </Avatar>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: "#2C2C2C",
                            fontSize: "1.1rem"
                          }}
                        >
                          {memberName}
                        </Typography>
                        {isCurrentUser && (
                          <Chip
                            label="You"
                            size="small"
                            sx={{
                              backgroundColor: "#e3f2fd",
                              color: "#1976d2",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: 24,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          icon={getRoleIcon(member.role)}
                          label={member.role || "Member"}
                          size="small"
                          color={getRoleColor(member.role)}
                          sx={{ 
                            fontWeight: 500,
                            "& .MuiChip-icon": {
                              color: "inherit",
                            }
                          }}
                        />
                      </Box>
                    }
                  />
                  
                  {canRemoveMember(member) && (
                    <Tooltip title="Remove from project">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveClick(member)}
                        disabled={isRemovingMember}
                        sx={{
                          color: "#ff5252",
                          backgroundColor: "rgba(255, 82, 82, 0.08)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 82, 82, 0.12)",
                            transform: "scale(1.05)",
                          },
                          "&:disabled": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            color: "rgba(0, 0, 0, 0.26)",
                          },
                          transition: "all 0.2s ease-in-out",
                          width: 40,
                          height: 40,
                        }}
                      >
                        <PersonRemove sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
              );
            })}
          </List>
        )}

        {/* Info Alert */}
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="body2" component="div">
            • Only owners and admins can remove members
            <br />
            • You cannot remove yourself or the project owner
            <br />• Pending members need approval in the "Requests" tab
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<Close />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 500,
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Remove Member Confirmation Dialog */}
      <RemoveMemberConfirmDialog
        open={confirmDialogOpen}
        memberName={memberToRemove?.name || ""}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        isRemoving={isRemovingMember}
      />
    </Dialog>
  );
};

export default ManageMembersDialog;
