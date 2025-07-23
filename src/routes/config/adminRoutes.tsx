import { lazy } from "react";
import { Route } from "../../common/types/route";
import { PATH_ADMIN } from "../paths";
import Loadable from "../../components/Loadable";

const AdminDashboardPage = Loadable(
  lazy(() => import("../../pages/admin/AdminDashboardPage"))
);

export const adminRoutes: Route[] = [
  {
    path: PATH_ADMIN.dashboard,
    component: <AdminDashboardPage />,
    index: false,
  },
];
