export interface TaskMember {
  id: string;
  workTaskId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: "OWNER" | "ASSIGNEE" | "REVIEWER" | "MEMBER";
  assignedByUserId: string;
  assignedAt: string;
  isRemoved?: boolean;
  removedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskMemberRequest {
  userId: string;
  userName?: string;
  userEmail?: string;
  role?: "OWNER" | "ASSIGNEE" | "REVIEWER" | "MEMBER";
}

export interface UpdateTaskMemberRequest {
  userId?: string;
  userName?: string;
  userEmail?: string;
  role?: "OWNER" | "ASSIGNEE" | "REVIEWER" | "MEMBER";
}

export interface TaskMemberListResponse {
  members: TaskMember[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
