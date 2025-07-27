import React, { Suspense, useEffect, useState, lazy } from "react";
import { Routes, Route as ReactRoute, Navigate } from "react-router-dom";

// Routes config
import { userRoutes } from "./config/userRoutes";
import {
  PATH_AUTH,
  PATH_ERROR,
  PATH_USER,
  PATH_ADMIN,
  PATH_PUBLIC,
} from "./paths";
// import type { Route } from "common/types/route"; // Will be used later when adding more routes
import { Role } from "../common/enums/role.enum";
import { getAccessToken } from "../utils";
import { useAppSelector } from "../redux/configStore";
import AdminRouter from "./adminRouter";

// Temporary placeholder components until pages are created
const PlaceholderPage = ({ pageName }: { pageName: string }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f9f9f9",
    }}
  >
    <h1 style={{ color: "#555", marginBottom: "16px" }}>{pageName}</h1>
    <p style={{ color: "#777", fontSize: "16px" }}>
      Trang này đang được phát triển...
    </p>
  </div>
);

// Auth pages - import from actual components
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignUp = lazy(() => import("../pages/auth/SignUp"));
const ForgotPassword = lazy(() =>
  Promise.resolve({
    default: () => <PlaceholderPage pageName="Quên Mật Khẩu" />,
  })
);
const ResetPassword = lazy(() =>
  Promise.resolve({
    default: () => <PlaceholderPage pageName="Đặt Lại Mật Khẩu" />,
  })
);
const EmailVerification = lazy(() =>
  Promise.resolve({
    default: () => <PlaceholderPage pageName="Xác Thực Email" />,
  })
);

// User pages - import from actual components
const HomePage = lazy(() => import("../pages/user/HomePage"));
const Dashboard = lazy(() => import("../pages/user/Dashboard"));
// CreateProjectPage is now imported via userRoutes config

// Error pages
const Page404 = lazy(() =>
  Promise.resolve({
    default: () => <PlaceholderPage pageName="404 - Không Tìm Thấy Trang" />,
  })
);
const Page500 = lazy(() =>
  Promise.resolve({
    default: () => <PlaceholderPage pageName="500 - Lỗi Máy Chủ" />,
  })
);

// Enhanced loader component
const Loader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      fontSize: "18px",
      color: "#333",
      flexDirection: "column",
      backgroundColor: "#f5f5f5",
    }}
  >
    <div style={{ marginBottom: "16px" }}>Đang tải...</div>
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #6ACCD9",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Helper function to render routes from config
const renderRoutes = (
  routes: typeof userRoutes,
  isAuthenticated: boolean,
  accessToken: string | null | undefined
) => {
  return routes.map((route, index) => (
    <ReactRoute
      key={index}
      path={route.path}
      element={
        isAuthenticated && accessToken ? (
          route.component
        ) : (
          <Navigate to={PATH_AUTH.login} replace />
        )
      }
    />
  ));
};

function AppRouter() {
  const [isInitializing, setIsInitializing] = useState(true);

  // Use actual Redux state instead of mock state
  const { isAuthenticated, userAuth } = useAppSelector((state) => state.auth);

  // Always check latest token from localStorage
  const accessToken = getAccessToken();

  const isAdmin = userAuth?.roles?.includes(Role.TASCO_ADMIN);

  // Add a short delay to ensure auth state is fully loaded
  useEffect(() => {
    // Đặt một timeout để đảm bảo state được khởi tạo đầy đủ
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen during initialization
  if (isInitializing) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* PUBLIC ROUTES - No authentication required */}

        {/* Root path - Redirect authenticated users to user dashboard */}
        <ReactRoute
          path="/"
          element={
            isAuthenticated && accessToken ? (
              <Navigate to={PATH_USER.dashboard} replace />
            ) : (
              <HomePage />
            )
          }
        />

        {/* Public homepage path - Same as root */}
        <ReactRoute path={PATH_PUBLIC.homepage} element={<HomePage />} />

        {/* PRIVATE ROUTES - Authentication required */}

        {/* User Routes from config */}
        {renderRoutes(userRoutes, isAuthenticated, accessToken)}

        {/* ADMIN ROUTES - Protected by AdminRouter with wildcard pattern */}
        <ReactRoute path="/admin/*" element={<AdminRouter />} />

        {/* Legacy routes - will be removed later */}

        {/* Specific Board - Protected route */}
        <ReactRoute
          path="/user/board/:boardId"
          element={
            isAuthenticated && accessToken ? (
              <Dashboard />
            ) : (
              <Navigate to={PATH_AUTH.login} replace />
            )
          }
        />

        {/* User Homepage - Authenticated user homepage */}
        <ReactRoute
          path={PATH_USER.homepage}
          element={
            isAuthenticated && accessToken ? (
              <HomePage />
            ) : (
              <Navigate to={PATH_AUTH.login} replace />
            )
          }
        />

        {/* AUTH ROUTES */}
        <ReactRoute
          path={PATH_AUTH.login}
          element={
            isAuthenticated && accessToken ? (
              <Navigate
                to={isAdmin ? PATH_ADMIN.dashboard : PATH_USER.homepage}
                replace
              />
            ) : (
              <LoginPage />
            )
          }
        />
        <ReactRoute
          path={PATH_AUTH.register}
          element={
            isAuthenticated && accessToken ? (
              <Navigate
                to={isAdmin ? PATH_ADMIN.dashboard : PATH_USER.homepage}
                replace
              />
            ) : (
              <SignUp />
            )
          }
        />
        <ReactRoute
          path={PATH_AUTH.forgotPassword}
          element={
            isAuthenticated && accessToken ? (
              <Navigate
                to={isAdmin ? PATH_ADMIN.dashboard : PATH_USER.dashboard}
                replace
              />
            ) : (
              <ForgotPassword />
            )
          }
        />
        <ReactRoute
          path={PATH_AUTH.resetPassword}
          element={
            isAuthenticated && accessToken ? (
              <Navigate
                to={isAdmin ? PATH_ADMIN.dashboard : PATH_USER.dashboard}
                replace
              />
            ) : (
              <ResetPassword />
            )
          }
        />
        <ReactRoute
          path={PATH_AUTH.verifyEmail}
          element={<EmailVerification />}
        />

        {/* ERROR ROUTES */}
        <ReactRoute path={PATH_ERROR.notFound} element={<Page404 />} />
        <ReactRoute path={PATH_ERROR.serverError} element={<Page500 />} />

        {/* CATCH-ALL - Redirect to 404 page */}
        <ReactRoute
          path="*"
          element={<Navigate to={PATH_ERROR.notFound} replace />}
        />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
