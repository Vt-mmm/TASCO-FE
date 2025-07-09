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
} from "@mui/material";
import { People, PersonRemove, Close } from "@mui/icons-material";
import { ProjectMember } from "../../../common/models/project";
import {
  getUserDisplayName,
  isCurrentUser as checkIsCurrentUser,
} from "../../../utils/userService";

interface Props {
  open: boolean;
  onClose: () => void;
  members: ProjectMember[];
  pendingMembers: ProjectMember[];
  currentUserId: string;
  onRemoveMember: (memberId: string) => Promise<void>;
}

const ManageMembersDialog: React.FC<Props> = ({
  open,
  onClose,
  members,
  pendingMembers,
  currentUserId,
  onRemoveMember,
}) => {
  const [memberDisplayNames, setMemberDisplayNames] = useState<
    Map<string, string>
  >(new Map());
  const [currentUserFlags, setCurrentUserFlags] = useState<
    Map<string, boolean>
  >(new Map());

  useEffect(() => {
    const loadUserDisplayNames = async () => {
      if (!open) return;

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

  const canRemoveMember = (member: ProjectMember): boolean => {
    // Không thể xóa owner
    if (member.role?.toLowerCase() === "owner") return false;
    // Không thể xóa chính mình
    if (member.userId === currentUserId) return false;
    return true;
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
            {members.map((member) => (
              <ListItem
                key={member.id || member.userId}
                sx={{
                  border: "1px solid rgba(44, 44, 44, 0.1)",
                  borderRadius: 2,
                  mb: 1,
                  "&:last-child": { mb: 0 },
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={500}>
                        {memberDisplayNames.get(member.userId) || "Loading..."}
                      </Typography>
                      {currentUserFlags.get(member.userId) && (
                        <Chip
                          label="You"
                          size="small"
                          sx={{
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            fontWeight: 500,
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Chip
                        label={member.role || "Member"}
                        size="small"
                        color={getRoleColor(member.role)}
                        sx={{ fontWeight: 500 }}
                      />
                      <Typography variant="caption" color="#999999">
                        Joined{" "}
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString()
                          : "Unknown"}
                      </Typography>
                    </Box>
                  }
                />
                {canRemoveMember(member) && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<PersonRemove />}
                    onClick={() => onRemoveMember(member.id || member.userId)}
                    sx={{
                      minWidth: "auto",
                      px: 2,
                      py: 0.5,
                      fontSize: "0.8rem",
                    }}
                  >
                    Remove
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        )}

        {/* Pending Approval Section */}
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "#f57c00", fontWeight: 600 }}
        >
          Pending Approval ({pendingMembers.length})
        </Typography>

        {pendingMembers.length === 0 ? (
          <Box
            sx={{
              py: 2,
              textAlign: "center",
              color: "#999999",
            }}
          >
            <Typography variant="body2">No pending members</Typography>
          </Box>
        ) : (
          <List sx={{ py: 0, mb: 2 }}>
            {pendingMembers.map((member) => (
              <ListItem
                key={member.id || member.userId}
                sx={{
                  border: "1px solid rgba(245, 124, 0, 0.2)",
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: "rgba(245, 124, 0, 0.05)",
                  "&:last-child": { mb: 0 },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={500}>
                      {memberDisplayNames.get(member.userId) || "Loading..."}
                    </Typography>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Chip
                        label="Pending"
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 500 }}
                      />
                      <Typography variant="caption" color="#999999">
                        Applied{" "}
                        {member.appliedAt
                          ? new Date(member.appliedAt).toLocaleDateString()
                          : "Unknown date"}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
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
    </Dialog>
  );
};

export default ManageMembersDialog;
