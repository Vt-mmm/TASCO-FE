import { path } from "../utils";
const ROOTS_ERROR = "/error";
const ROOTS_AUTH = "/auth";
const ROOTS_USER = "/user";
const ROOTS_ADMIN = "/admin";

export const PATH_ERROR = {
  noPermission: path(ROOTS_ERROR, "/403"),
  notFound: path(ROOTS_ERROR, "/404"),
  serverError: path(ROOTS_ERROR, "/500"),
};
export const PATH_AUTH = {
  root: "/auth",
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyEmail: "/auth/verify-email",
};
export const PATH_USER = {
  root: ROOTS_USER,
  homepage: path(ROOTS_USER, "/homepage"),
  dashboard: path(ROOTS_USER, "/dashboard"),
  profile: path(ROOTS_USER, "/profile"),

  // Projects
  projects: path(ROOTS_USER, "/projects"),
  projectCreate: path(ROOTS_USER, "/projects/create"),
  projectExplore: path(ROOTS_USER, "/projects/explore"),
  projectDetail: (id: string) => path(ROOTS_USER, `/projects/${id}`),
  projectSettings: (id: string) => path(ROOTS_USER, `/projects/${id}/settings`),

  // Work Areas
  workAreas: (projectId: string) =>
    path(ROOTS_USER, `/projects/${projectId}/workareas`),
  workAreaDetail: (projectId: string, workAreaId: string) =>
    path(ROOTS_USER, `/projects/${projectId}/workareas/${workAreaId}`),

  // Work Tasks
  workTasks: (workAreaId: string) =>
    path(ROOTS_USER, `/workareas/${workAreaId}/worktasks`),
  workTaskDetail: (workAreaId: string, workTaskId: string) =>
    path(ROOTS_USER, `/workareas/${workAreaId}/worktasks/${workTaskId}`),

  // Task Objectives
  taskObjectives: (workTaskId: string) =>
    path(ROOTS_USER, `/worktasks/${workTaskId}/taskobjectives`),
  taskObjectiveDetail: (workTaskId: string, taskObjectiveId: string) =>
    path(
      ROOTS_USER,
      `/worktasks/${workTaskId}/taskobjectives/${taskObjectiveId}`
    ),
};

export const PATH_ADMIN = {
  dashboard: path(ROOTS_ADMIN, "/dashboard"),
};
export const PATH_PUBLIC = {
  homepage: "/",
  login: path(ROOTS_AUTH, "/login"),
  register: path(ROOTS_AUTH, "/register"),
  forgotPassword: path(ROOTS_AUTH, "/forgot-password"),
  resetPassword: path(ROOTS_AUTH, "/reset-password"),
  verifyEmail: path(ROOTS_AUTH, "/verify-email"),
};
