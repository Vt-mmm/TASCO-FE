import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
} from "@mui/material";
import {
  PersonAdd,
  Check,
  Close,
  Notifications,
  Person,
} from "@mui/icons-material";
import { ProjectRequest } from "../../../common/models/project";
import { getUserDisplayName } from "../../../utils/userService";

interface Props {
  open: boolean;
  projectRequests: ProjectRequest[];
  onClose: () => void;
  onApproveRequest: (requestId: string) => Promise<void>;
  onRejectRequest: (requestId: string, reason?: string) => Promise<void>;
}

const JoinRequestDialog: React.FC<Props> = ({
  open,
  projectRequests,
  onClose,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [requestDisplayNames, setRequestDisplayNames] = useState<
    Map<string, string>
  >(new Map());

  useEffect(() => {
    const loadRequestDisplayNames = async () => {
      if (!open) return;

      const displayNames = new Map<string, string>();

      // Load display names cho tất cả requests
      await Promise.all(
        projectRequests.map(async (request) => {
          const displayName = await getUserDisplayName(
            request.userId,
            request.userName
          );
          displayNames.set(request.userId, displayName);
        })
      );

      setRequestDisplayNames(displayNames);
    };

    loadRequestDisplayNames();
  }, [open, projectRequests]);

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
        <PersonAdd sx={{ color: "#2C2C2C" }} />
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: 600, color: "#2C2C2C" }}
        >
          Join Requests
        </Typography>
        <Badge
          badgeContent={
            projectRequests.filter((r) => r.status === "pending").length
          }
          color="error"
          sx={{ ml: 1 }}
        >
          <Notifications sx={{ fontSize: 20, opacity: 0.7 }} />
        </Badge>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {projectRequests.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              color: "#999999",
            }}
          >
            <PersonAdd sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" textAlign="center">
              No join requests at the moment
            </Typography>
            <Typography variant="caption" textAlign="center" sx={{ mt: 1 }}>
              Join requests will appear here when users request to join this
              project
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {projectRequests.map((request) => (
              <ListItem
                key={request.id}
                sx={{
                  border: "1px solid rgba(44, 44, 44, 0.1)",
                  borderRadius: 2,
                  mb: 2,
                  "&:last-child": { mb: 0 },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: "#2C2C2C",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {requestDisplayNames.get(request.userId) || "Loading..."}
                    </Typography>
                  }
                  secondary={
                    <Box component="div">
                      <Typography
                        variant="body2"
                        color="#666666"
                        sx={{ mb: 1 }}
                        component="div"
                      >
                        {request.requestMessage || "Wants to join this project"}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={request.status}
                          size="small"
                          color={
                            request.status === "pending"
                              ? "warning"
                              : request.status === "approved"
                              ? "success"
                              : "error"
                          }
                          sx={{ fontWeight: 500 }}
                        />
                        <Typography
                          variant="caption"
                          color="#999999"
                          component="span"
                        >
                          {request.appliedAt
                            ? new Date(request.appliedAt).toLocaleDateString()
                            : "Unknown date"}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondaryTypographyProps={{
                    component: "div",
                  }}
                />
                {request.status === "pending" && (
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<Check />}
                        onClick={() => onApproveRequest(request.id)}
                        sx={{
                          minWidth: "auto",
                          px: 2,
                          py: 0.5,
                          fontSize: "0.8rem",
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Close />}
                        onClick={() => onRejectRequest(request.id)}
                        sx={{
                          minWidth: "auto",
                          px: 2,
                          py: 0.5,
                          fontSize: "0.8rem",
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
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

export default JoinRequestDialog;
