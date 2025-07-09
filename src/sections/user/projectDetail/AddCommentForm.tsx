import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Send, Person } from "@mui/icons-material";
import { CreateCommentRequest } from "../../../common/models/comment";
import {
  getUserDisplayName,
  getCurrentUserInfo,
} from "../../../utils/userService";

interface AddCommentFormProps {
  taskId: string;
  onSubmit: (commentData: CreateCommentRequest) => void;
  isLoading?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({
  taskId,
  onSubmit,
  isLoading = false,
  currentUserId,
  currentUserName,
}) => {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const commentData: CreateCommentRequest = {
      taskId,
      content: content.trim(),
    };

    onSubmit(commentData);
    setContent("");
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        border: isFocused
          ? "2px solid #494A7E"
          : "1px solid rgba(44, 44, 44, 0.12)",
        transition: "border-color 0.2s ease",
        backgroundColor: isFocused ? "rgba(73, 74, 126, 0.02)" : "transparent",
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* User Avatar */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            backgroundColor: "#494A7E",
            fontSize: "0.9rem",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <Person sx={{ fontSize: 20 }} />
        </Avatar>

        {/* Comment Input Area */}
        <Box sx={{ flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={isFocused ? 3 : 1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => !content.trim() && setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
              disabled={isLoading}
              sx={{
                mb: isFocused ? 1.5 : 0,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.9rem",
                  backgroundColor: "transparent",
                  transition: "all 0.2s ease",
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: "8px 12px",
                },
              }}
            />

            {/* Action Bar - Only show when focused or has content */}
            {(isFocused || content.trim()) && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#666666",
                    fontSize: "0.75rem",
                  }}
                >
                  Tip: Press Ctrl+Enter to submit
                </Typography>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setContent("");
                      setIsFocused(false);
                    }}
                    disabled={isLoading}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      color: "#666666",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="small"
                    variant="contained"
                    disabled={isLoading || !content.trim()}
                    startIcon={<Send sx={{ fontSize: 16 }} />}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      backgroundColor: "#494A7E",
                      "&:hover": {
                        backgroundColor: "#3D3E6B",
                      },
                      "&:disabled": {
                        backgroundColor: "rgba(44, 44, 44, 0.12)",
                      },
                    }}
                  >
                    {isLoading ? "Posting..." : "Comment"}
                  </Button>
                </Box>
              </Box>
            )}
          </form>
        </Box>
      </Box>

      {/* User Info Display */}
      {(isFocused || content.trim()) && currentUserId && (
        <Box
          sx={{
            mt: 1,
            pl: 6, // Align with text field (avatar width + gap)
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#888888",
              fontSize: "0.7rem",
            }}
          >
            Commenting as {getUserDisplayName(currentUserId, currentUserName)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AddCommentForm;
