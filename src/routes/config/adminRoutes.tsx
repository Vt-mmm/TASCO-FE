import { lazy } from "react";
import { Route } from "../../common/types/route";
import Loadable from "../../components/Loadable";

const AdminDashboardPage = Loadable(
  lazy(() => import("../../pages/admin/AdminDashboardPage"))
);

export const adminRoutes: Route[] = [
  {
    path: "/dashboard", // Relative path - will be /admin/dashboard when combined
    component: <AdminDashboardPage />,
    index: false,
  },
];
