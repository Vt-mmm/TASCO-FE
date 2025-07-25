import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  Person,
  Save,
  Cancel,
} from "@mui/icons-material";
import { Comment } from "../../../common/models/comment";
import { getUserDisplayName } from "../../../utils/userService";

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  isLoading?: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [displayName, setDisplayName] = useState(
    comment.userName || "Loading..."
  );

  const isOwner = currentUserId === comment.userId;
  const menuOpen = Boolean(anchorEl);

  // Load display name
  React.useEffect(() => {
    const loadDisplayName = async () => {
      try {
        const name = await getUserDisplayName(
          comment.userId,
          comment.userName
        );
        setDisplayName(name);
      } catch {
        setDisplayName(
          comment.userName || `User ${comment.userId.substring(0, 8)}...`
        );
      }
    };

    loadDisplayName();
  }, [comment.userId, comment.userName]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(comment.id);
    }
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== comment.content.trim()) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(44, 44, 44, 0.08)",
        border: "1px solid rgba(44, 44, 44, 0.1)",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(44, 44, 44, 0.12)",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Comment Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: "#494A7E",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              {comment.authorAvatar ? (
                <img
                  src={comment.authorAvatar}
                  alt={comment.userName}
                  style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                />
              ) : (
                <Person sx={{ fontSize: 20 }} />
              )}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "#2C2C2C",
                  lineHeight: 1.2,
                }}
              >
                {displayName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#666666",
                    fontSize: "0.75rem",
                  }}
                >
                  {formatDate(comment.createdAt)}
                </Typography>
                {comment.createdAt !== comment.updatedAt && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#888888",
                      fontSize: "0.7rem",
                      fontStyle: "italic",
                    }}
                  >
                    (edited)
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {isOwner && (onEdit || onDelete) && !isEditing && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                color: "#666666",
                "&:hover": {
                  backgroundColor: "rgba(44, 44, 44, 0.08)",
                },
              }}
            >
              <MoreVert sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>

        {/* Comment Content */}
        {isEditing ? (
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit your comment..."
              disabled={isLoading}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.9rem",
                },
              }}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                size="small"
                onClick={handleCancelEdit}
                disabled={isLoading}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  color: "#666666",
                }}
              >
                <Cancel sx={{ fontSize: 16, mr: 0.5 }} />
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSaveEdit}
                disabled={isLoading || !editContent.trim()}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  backgroundColor: "#494A7E",
                  "&:hover": {
                    backgroundColor: "#3D3E6B",
                  },
                }}
              >
                <Save sx={{ fontSize: 16, mr: 0.5 }} />
                Save
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "#333333",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {comment.content}
          </Typography>
        )}
      </CardContent>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 16px rgba(44, 44, 44, 0.12)",
            minWidth: 120,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {onEdit && (
          <MenuItem
            onClick={handleEditClick}
            sx={{ gap: 1, fontSize: "0.9rem" }}
          >
            <Edit sx={{ fontSize: 16 }} />
            Edit
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={handleDeleteClick}
            sx={{ gap: 1, fontSize: "0.9rem", color: "error.main" }}
          >
            <Delete sx={{ fontSize: 16 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default CommentCard;
