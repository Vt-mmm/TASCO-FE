import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import AdminHeader from "../../layout/components/header/AdminHeader";
import { Sidebar } from "../../layout/sidebar";
import { useAppDispatch, useAppSelector } from "../../redux/configStore";
import { fetchProjectsThunk } from "../../redux/adminDashboard/adminDashboardThunks";
import AnalyticsWidget from "../../sections/admin/dashboard/AnalyticsWidget";
import AdminWelcome from "../../sections/admin/dashboard/AdminWelcome";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import ProjectListTable from "../../sections/admin/dashboard/ProjectListTable";

const AdminDashboardPage: React.FC = () => {
  const [openNav, setOpenNav] = useState(false);
  const dispatch = useAppDispatch();
  const { projects, totalCount, pageNumber, pageSize, loading } =
    useAppSelector((state) => state.adminDashboard);

  useEffect(() => {
    dispatch(fetchProjectsThunk({ pageNumber: 1, pageSize: 10 }));
  }, [dispatch]);

  const handleOpenNav = () => setOpenNav(true);
  const handleCloseNav = () => setOpenNav(false);

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(fetchProjectsThunk({ pageNumber: newPage + 1, pageSize }));
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(
      fetchProjectsThunk({
        pageNumber: 1,
        pageSize: parseInt(event.target.value, 10),
      })
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar openNav={openNav} onCloseNav={handleCloseNav} />
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <AdminHeader title="Admin Dashboard" onOpenNav={handleOpenNav} />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <AdminWelcome />
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              mb: 3,
            }}
          >
            <AnalyticsWidget
              title="Total Projects"
              value={totalCount}
              icon={<FolderSpecialIcon />}
              color="success"
              loading={loading}
            />
          </Box>
          <ProjectListTable
            projects={projects}
            totalCount={totalCount}
            page={pageNumber - 1}
            rowsPerPage={pageSize}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;
