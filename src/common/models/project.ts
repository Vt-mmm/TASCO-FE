import { WorkArea } from "./workArea";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "completed" | "archived" | "cancelled";
  ownerId: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  workAreas?: WorkArea[];
  progress?: number;
}

export interface ProjectMember {
  id?: string;
  userId: string;
  userName?: string; // Display name for the user
  userEmail?: string; // Email của user
  userGmail?: string; // Email từ backend (tên field khác)
  projectId?: string;
  role:
    | "owner"
    | "admin"
    | "member"
    | "viewer"
    | "OWNER"
    | "ADMIN"
    | "MEMBER"
    | "VIEWER";
  approvedStatus?:
    | "pending"
    | "approved"
    | "rejected"
    | "removed"
    | "APPROVED"
    | "PENDING"
    | "REJECTED"
    | "REMOVED";
  approvedUpdateDate?: string;
  isRemoved?: boolean;
  removeDate?: string;
  joinedAt?: string;
  appliedAt?: string;
  // Legacy field for backward compatibility
  status?:
    | "pending"
    | "approved"
    | "rejected"
    | "removed"
    | "APPROVED"
    | "PENDING"
    | "REJECTED"
    | "REMOVED";
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  ownerId: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: "active" | "completed" | "archived" | "cancelled";
  startDate?: string;
  endDate?: string;
}

export interface UpdateMemberRoleRequest {
  role: "owner" | "admin" | "member" | "viewer";
}

export interface UpdateMemberStatusRequest {
  projectId: string;
  memberId: string;
  approvedStatus: string;
  ownerId: string;
}

export interface ApplyProjectRequest {
  message?: string;
}

export interface ProjectRequest {
  id: string;
  projectId: string;
  userId: string;
  userName?: string; // Display name for the user
  requestMessage?: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface CreateProjectRequestRequest {
  projectId: string;
  userId: string;
  requestMessage?: string;
}

export interface UpdateProjectRequestRequest {
  status: "approved" | "rejected";
  rejectionReason?: string;
}

// Interfaces for Admin Dashboard API Response
export interface AdminProjectMember {
  userId: string;
  role: "OWNER" | "MEMBER";
  approvedStatus: "APPROVED" | "PENDING" | "REJECTED" | "REMOVED";
  approvedUpdateDate: string;
  isRemoved: boolean;
  removeDate: string | null;
}

export interface AdminProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updateBy: string;
  updatedAt: string;
  members: AdminProjectMember[];
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface PaginatedProjectResponse {
  projects: AdminProject[];
  totalPage: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
}
