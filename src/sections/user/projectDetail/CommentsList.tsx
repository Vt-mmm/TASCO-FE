import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Alert,
  Skeleton,
  Chip,
  Pagination,
} from "@mui/material";
import { Comment as CommentIcon, ChatBubbleOutline } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/configStore";
import {
  getCommentsByTaskThunk,
  createCommentThunk,
  updateCommentThunk,
  deleteCommentThunk,
} from "../../../redux/comments/commentsThunks";
import {
  clearCurrentTaskComments,
  resetToFirstPage,
} from "../../../redux/comments/commentsSlice";
import { CreateCommentRequest } from "../../../common/models/comment";
import { getCurrentUserInfo } from "../../../utils/userService";
import AddCommentForm from "./AddCommentForm";
import CommentCard from "./CommentCard";

interface CommentsListProps {
  taskId: string;
  taskName?: string;
}

const CommentsList: React.FC<CommentsListProps> = ({ taskId, taskName }) => {
  const dispatch = useAppDispatch();
  const userAuth = useAppSelector((state) => state.auth.userAuth);

  const {
    currentTaskComments,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
  } = useAppSelector((state) => state.comments);

  // Track loading initial comments
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track user info for display
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Load comments when component mounts or page changes
  useEffect(() => {
    if (taskId) {
      dispatch(
        getCommentsByTaskThunk({ taskId, pageIndex: currentPage, pageSize })
      );
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }

    // Cleanup when component unmounts
    return () => {
      dispatch(clearCurrentTaskComments());
    };
  }, [dispatch, taskId, currentPage, isInitialLoad, pageSize]);

  // Get current user info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await getCurrentUserInfo();
        if (userInfo) {
          setCurrentUserInfo({
            id: userAuth?.userId || "",
            name: userInfo.fullName || "Unknown User",
          });
        }
      } catch {
        setCurrentUserInfo({
          id: userAuth?.userId || "",
          name: "Unknown User",
        });
      }
    };

    if (userAuth) {
      loadUserInfo();
    }
  }, [userAuth]);

  const handleCreateComment = async (commentData: CreateCommentRequest) => {
    try {
      await dispatch(createCommentThunk(commentData)).unwrap();

      // Reset to first page to show new comment
      dispatch(resetToFirstPage());
    } catch (error) {
      // Check if it's authentication error
      if (typeof error === "string" && error.includes("Authentication")) {
        // Authentication error - user may need to login
      }

      // Fallback: Refresh comments from server anyway to check if it was created
      setTimeout(() => {
        dispatch(resetToFirstPage());
      }, 1000);
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      await dispatch(
        updateCommentThunk({
          commentId,
          commentData: { content: newContent },
        })
      ).unwrap();
    } catch {
      // Error already handled by toast
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await dispatch(deleteCommentThunk(commentId)).unwrap();
      } catch {
        // Error already handled by toast
      }
    }
  };

  // Handle pagination change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    dispatch(getCommentsByTaskThunk({ taskId, pageIndex: page, pageSize }));
  };

  const renderLoadingSkeleton = () => (
    <Box sx={{ mt: 2 }}>
      {[1, 2, 3].map((index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="30%" height={20} />
              <Skeleton variant="text" width="15%" height={16} />
            </Box>
          </Box>
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      ))}
    </Box>
  );

  const renderEmptyState = () => (
    <Box
      sx={{
        textAlign: "center",
        py: 6,
        color: "#666666",
      }}
    >
      <ChatBubbleOutline
        sx={{
          fontSize: 48,
          color: "#CCCCCC",
          mb: 2,
        }}
      />
      <Typography variant="h6" sx={{ color: "#888888", mb: 1 }}>
        No comments yet
      </Typography>
      <Typography variant="body2" sx={{ color: "#AAAAAA" }}>
        Be the first to comment on this task
      </Typography>
    </Box>
  );

  const renderPagination = () => {
    if (pageCount <= 1) return null;

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 3,
          py: 2,
        }}
      >
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size="medium"
          showFirstButton
          showLastButton
          sx={{
            "& .MuiPaginationItem-root": {
              fontSize: "0.875rem",
            },
            "& .Mui-selected": {
              backgroundColor: "#494A7E !important",
              color: "white",
            },
          }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CommentIcon sx={{ color: "#494A7E", fontSize: 24 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#2C2C2C",
            }}
          >
            Comments
          </Typography>
          {totalCount > 0 && (
            <Chip
              label={totalCount}
              size="small"
              sx={{
                backgroundColor: "rgba(73, 74, 126, 0.1)",
                color: "#494A7E",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          )}
        </Box>

        {/* Pagination info */}
        {totalCount > 0 && (
          <Typography
            variant="body2"
            sx={{
              color: "#666666",
              fontSize: "0.875rem",
            }}
          >
            Page {currentPage} of {pageCount} ({totalCount} total)
          </Typography>
        )}
      </Box>

      {/* Task Name Reference */}
      {taskName && (
        <Typography
          variant="body2"
          sx={{
            color: "#666666",
            mb: 3,
            fontStyle: "italic",
          }}
        >
          Comments for: "{taskName}"
        </Typography>
      )}

      {/* Add Comment Form */}
      <Box sx={{ mb: 3 }}>
        <AddCommentForm
          taskId={taskId}
          onSubmit={handleCreateComment}
          isLoading={isCreating}
          currentUserId={currentUserInfo?.id}
          currentUserName={currentUserInfo?.name}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Error Message */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            // Optionally clear error message
          }}
        >
          {error}
        </Alert>
      )}

      {/* Comments List */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : currentTaskComments.length === 0 ? (
        renderEmptyState()
      ) : (
        <Box sx={{ mt: 2 }}>
          {currentTaskComments
            .filter((comment) => comment && comment.id) // Filter out undefined/invalid comments
            .map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={currentUserInfo?.id}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                isLoading={isUpdating || isDeleting}
              />
            ))}
        </Box>
      )}

      {/* Pagination */}
      {renderPagination()}
    </Box>
  );
};

export default CommentsList;
