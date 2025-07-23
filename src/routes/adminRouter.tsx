import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/configStore";
import { PATH_AUTH, PATH_ERROR } from "./paths";
import { getUserInfo } from "../redux/auth/authSlice";
import { Role } from "../common/enums";
import { Box, CircularProgress } from "@mui/material";

const AdminRouter = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accountInfo, isLoading } = useAppSelector(
    (state) => state.auth
  );
  const { pathname } = useLocation();

  useEffect(() => {
    // If user is logged in but we don't have their details (e.g., after a refresh), fetch them.
    if (isAuthenticated && !accountInfo) {
      dispatch(getUserInfo());
    }
  }, [isAuthenticated, accountInfo, dispatch]);

  const isAdmin = accountInfo?.roles?.includes(Role.TASCO_ADMIN);

  // While checking authentication or fetching user info, show a loader.
  if (isLoading || (isAuthenticated && !accountInfo)) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, redirect them to the login page.
  if (!isAuthenticated) {
    return <Navigate to={`${PATH_AUTH.login}?redirect=${pathname}`} replace />;
  }

  // If user is authenticated but not an admin, show a "Permission Denied" page.
  if (!isAdmin) {
    return <Navigate to={PATH_ERROR.noPermission} replace />;
  }

  // If all checks pass, render the nested admin routes.
  return <Outlet />;
};

export default AdminRouter;
