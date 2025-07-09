import { Route } from "../../common/types/route";
import { PATH_PUBLIC, PATH_USER } from "../paths";
import HomePage from "../../pages/user/HomePage";
import Dashboard from "../../pages/user/Dashboard";
import CreateProjectPage from "../../pages/user/CreateProjectPage";
import ProjectDetailPage from "../../pages/user/ProjectDetailPage";
import ExploreProjectsPage from "../../pages/user/ExploreProjectsPage";

// Public routes - accessible without authentication
export const publicRoutes: Route[] = [
  {
    path: PATH_PUBLIC.homepage,
    component: <HomePage />,
    index: true,
  },
];

// Private routes - only for authenticated users
export const userRoutes: Route[] = [
  {
    path: PATH_USER.homepage,
    component: <HomePage />,
    index: false,
  },
  // Main dashboard
  {
    path: PATH_USER.dashboard,
    component: <Dashboard />,
    index: false,
  },
  // Project management routes
  {
    path: PATH_USER.projectCreate,
    component: <CreateProjectPage />,
    index: false,
  },
  {
    path: PATH_USER.projectExplore,
    component: <ExploreProjectsPage />,
    index: false,
  },
  // Project detail routes (will be added later)
  {
    path: "/user/projects/:id",
    component: <ProjectDetailPage />,
    index: false,
  },
  // {
  //   path: "/projects/:id/settings",
  //   component: <ProjectSettingsPage />,
  //   index: false,
  // },
  // Work Areas routes (will be added later)
  // {
  //   path: "/projects/:projectId/workareas",
  //   component: <WorkAreasPage />,
  //   index: false,
  // },
];

// Admin routes - only for admin users
export const adminRoutes: Route[] = [
  // Will be added later when needed
];

// Auth routes - for login/register flows
export const authRoutes: Route[] = [
  // Will be added later when auth pages are created
];
