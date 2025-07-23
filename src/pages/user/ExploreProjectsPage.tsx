import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../redux/configStore";
import { getExploreProjectsThunk } from "../../redux/projects/projectsThunks";
import {
  resetPagination,
  setCurrentPage,
  setPageSize,
} from "../../redux/projects/projectsSlice";
import { Header } from "../../layout/components/header";
import { ProjectsTable } from "../../sections/user/exploreProjects";

const ExploreProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, totalCount, pageCount, currentPage, pageSize, isLoading } =
    useAppSelector((state) => state.projects);

  // Get current user info to filter out owned projects
  const { userAuth } = useAppSelector((state) => state.auth);
  const currentUserId = userAuth?.userId;

  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset pagination when component mounts
    dispatch(resetPagination());

    // Load initial data
    dispatch(
      getExploreProjectsThunk({
        pageNumber: 1,
        pageSize: 12,
        search: "",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    const timeout = window.setTimeout(() => {
      dispatch(resetPagination());
      dispatch(
        getExploreProjectsThunk({
          pageNumber: 1,
          pageSize,
          search: searchTerm,
        })
      );
    }, 500);

    searchTimeoutRef.current = timeout;

    // Cleanup timeout on unmount
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm, pageSize, dispatch]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    dispatch(setCurrentPage(page));
    dispatch(
      getExploreProjectsThunk({
        pageNumber: page,
        pageSize,
        search: searchTerm,
      })
    );
  };

  const handlePageSizeChange = (newPageSize: number) => {
    dispatch(setPageSize(newPageSize));
    dispatch(setCurrentPage(1));
    dispatch(
      getExploreProjectsThunk({
        pageNumber: 1,
        pageSize: newPageSize,
        search: searchTerm,
      })
    );
  };

  // Filter out projects where current user is the owner OR already a member
  const filteredProjects = projects.filter((project) => {
    // If no currentUserId, show all projects (user not logged in)
    if (!currentUserId) return true;

    // Filter out projects where user is owner
    if (project.ownerId === currentUserId) return false;

    // Filter out projects where user is already a member (approved)
    const isAlreadyMember = project.members?.some(
      (member) =>
        member.userId === currentUserId &&
        (member.status === "approved" ||
          member.status === "APPROVED" ||
          member.approvedStatus === "approved" ||
          member.approvedStatus === "APPROVED")
    );

    if (isAlreadyMember) return false;

    return true;
  });

  return (
    <Box
      sx={{
        bgcolor: "#FAFAFA",
        minHeight: "100vh",
      }}
    >
      <Header />

      <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "#2C2C2C",
            }}
          >
            Khám Phá Dự Án 🔍
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: "1.1rem" }}
          >
            Tìm và tham gia các dự án thú vị từ cộng đồng
          </Typography>
        </Box>

        {/* Info Alert - Only show to logged in users */}
        {currentUserId && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 2,
              backgroundColor: "#E3F2FD",
              border: "1px solid #BBDEFB",
              "& .MuiAlert-icon": {
                color: "#1976D2",
              },
            }}
          >
            <Typography variant="body2">
              💡 <strong>Lưu ý:</strong> Bạn chỉ thấy các dự án mà bạn chưa tham
              gia ở đây. Để quản lý dự án của riêng mình hoặc các dự án đã tham
              gia, hãy truy cập <strong>"My Projects"</strong> trong dashboard.
            </Typography>
          </Alert>
        )}

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm dự án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              bgcolor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Projects Table */}
        <ProjectsTable
          projects={filteredProjects}
          totalCount={totalCount}
          pageCount={pageCount}
          currentPage={currentPage}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Container>
    </Box>
  );
};

export default ExploreProjectsPage;
