import { path } from "../utils";

const ROOTS_AUTH = "/api/authentications";
const ROOTS_ACCOUNT = "/api/accounts";
const ROOTS_PROJECTS = "/api/projects";
const ROOTS_COMMENTS = "/api/comments";

export const ROUTES_API_AUTH = {
  LOGIN: path(ROOTS_AUTH, `/login`),
  REGISTER: path(ROOTS_AUTH, `/register`),
  REFRESH_TOKEN: path(ROOTS_AUTH, `/refresh-token`),
  LOGIN_GOOGLE: path(ROOTS_AUTH, `/login-google`),
  FORGOT_PASSWORD: path(ROOTS_ACCOUNT, `/forgot-password`),
  RESET_PASSWORD: path(ROOTS_ACCOUNT, `/reset-password`),
  CHANGE_PASSWORD: path(ROOTS_ACCOUNT, `/change-password`),
};

export const ROUTES_API_ACCOUNTS = {
  GET_INFO: path(ROOTS_ACCOUNT, `/get-info`),
};

export const ROUTES_API_PROJECTS = {
  GET_ALL: ROOTS_PROJECTS,
  CREATE: ROOTS_PROJECTS,
  GET_BY_ID: (projectId: string) => path(ROOTS_PROJECTS, `/${projectId}`),
  UPDATE: (projectId: string) => path(ROOTS_PROJECTS, `/${projectId}`),
  DELETE: (projectId: string) => path(ROOTS_PROJECTS, `/${projectId}`),
  // Project Members - nested under projects
  MEMBERS: (projectId: string) => path(ROOTS_PROJECTS, `/${projectId}/members`),
  MEMBER_BY_ID: (projectId: string, memberId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/members/${memberId}`),
};

export const ROUTES_API_PROJECT_MEMBERS = {
  DELETE_MEMBER: (projectId: string, memberId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/members/${memberId}`),
  UPDATE_APPROVED_STATUS: (projectId: string, memberId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/members/${memberId}/approved-status`),
  UPDATE_ROLE: (projectId: string, memberId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/members/${memberId}/role`),
  APPLY_PROJECT: (projectId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/members/applied-project`),
  GET_PENDING_REQUESTS: (projectId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/members/pending`),
};

// Work Areas - nested under projects
export const ROUTES_API_WORK_AREAS = {
  GET_BY_PROJECT: (projectId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/workareas`),
  CREATE: (projectId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/workareas`),
  GET_BY_ID: (projectId: string, workAreaId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/workareas/${workAreaId}`),
  UPDATE: (projectId: string, workAreaId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/workareas/${workAreaId}`),
  DELETE: (projectId: string, workAreaId: string) =>
    path(ROOTS_PROJECTS, `/${projectId}/workareas/${workAreaId}`),
};

// Work Tasks - nested under work areas
export const ROUTES_API_WORK_TASKS = {
  GET_BY_WORK_AREA: (workAreaId: string) =>
    `/api/workareas/${workAreaId}/worktasks`,
  CREATE: (workAreaId: string) => `/api/workareas/${workAreaId}/worktasks`,
  GET_BY_ID: (workAreaId: string, workTaskId: string) =>
    `/api/workareas/${workAreaId}/worktasks/${workTaskId}`,
  UPDATE: (workAreaId: string, workTaskId: string) =>
    `/api/workareas/${workAreaId}/worktasks/${workTaskId}`,
  DELETE: (workAreaId: string, workTaskId: string) =>
    `/api/workareas/${workAreaId}/worktasks/${workTaskId}`,
};

// Task Objectives - nested under work tasks
export const ROUTES_API_TASK_OBJECTIVES = {
  GET_BY_WORK_TASK: (workTaskId: string) =>
    `/api/worktasks/${workTaskId}/taskobjectives`,
  CREATE: (workTaskId: string) => `/api/worktasks/${workTaskId}/taskobjectives`,
  GET_BY_ID: (workTaskId: string, taskObjectiveId: string) =>
    `/api/worktasks/${workTaskId}/taskobjectives/${taskObjectiveId}`,
  UPDATE: (workTaskId: string, taskObjectiveId: string) =>
    `/api/worktasks/${workTaskId}/taskobjectives/${taskObjectiveId}`,
  DELETE: (workTaskId: string, taskObjectiveId: string) =>
    `/api/worktasks/${workTaskId}/taskobjectives/${taskObjectiveId}`,
  COMPLETE: (workTaskId: string, taskObjectiveId: string) =>
    `/api/worktasks/${workTaskId}/taskobjectives/${taskObjectiveId}/complete`,
};

// Task Members - nested under work tasks
export const ROUTES_API_TASK_MEMBERS = {
  GET_BY_WORK_TASK: (workTaskId: string) =>
    `/api/worktasks/${workTaskId}/members`,
  CREATE: (workTaskId: string) => `/api/worktasks/${workTaskId}/members`,
  GET_BY_ID: (workTaskId: string, memberId: string) =>
    `/api/worktasks/${workTaskId}/members/${memberId}`,
  UPDATE: (workTaskId: string, memberId: string) =>
    `/api/worktasks/${workTaskId}/members/${memberId}`,
  DELETE: (workTaskId: string, memberId: string) =>
    `/api/worktasks/${workTaskId}/members/${memberId}`,
  REMOVE: (workTaskId: string, memberId: string) =>
    `/api/worktasks/${workTaskId}/members/${memberId}/remove`,
};

export const ROUTES_API_COMMENTS = {
  CREATE: ROOTS_COMMENTS,
  GET_BY_TASK: (taskId: string) => path(ROOTS_COMMENTS, `/task/${taskId}`),
  UPDATE: (commentId: string) => path(ROOTS_COMMENTS, `/${commentId}`),
  DELETE: (commentId: string) => path(ROOTS_COMMENTS, `/${commentId}`),
};
