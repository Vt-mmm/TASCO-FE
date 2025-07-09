import { Route } from "common/types";
import HomePage from "pages/user/HomePage";

import { Page403, Page404, Page500 } from "pages/error";

import { PATH_ERROR } from "routes/paths";

export const publicRoutes: Route[] = [
  {
    path: "/", // PATH_PUBLIC.homepage = "/"
    component: <HomePage />,
    index: true,
  },
];

export const errorRoutes: Route[] = [
  {
    path: PATH_ERROR.noPermission,
    component: <Page403 />,
    index: true,
  },
  {
    path: PATH_ERROR.notFound,
    component: <Page404 />,
    index: false,
  },
  {
    path: PATH_ERROR.serverError,
    component: <Page500 />,
    index: false,
  },
];
