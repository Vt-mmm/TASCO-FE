export interface WorkArea {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  displayOrder: number;
  status: "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
  workTasks?: WorkTask[];
}

export interface WorkTask {
  id: string;
  name: string;
  description?: string;
  workAreaId: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignedToId?: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  taskObjectives?: TaskObjective[];
  // Task members for team collaboration
  taskMembers?: TaskMemberInfo[];
  // Computed fields for display
  objectivesCount?: number;
  completedObjectivesCount?: number;
}

// Task member info for display in WorkTask
export interface TaskMemberInfo {
  userId: string;
  userName: string;
  userEmail?: string;
  role: "OWNER" | "ASSIGNEE" | "REVIEWER" | "MEMBER";
  joinedAt: string;
  isRemoved?: boolean;
}

export interface TaskObjective {
  id: string;
  workTaskId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  displayOrder: number;
  createdDate: string;
  completedDate?: string;
  createdByUserId: string;
  completedByUserId?: string;
}

// Request models
export interface CreateWorkAreaRequest {
  name: string;
  description?: string;
  displayOrder: number;
}

export interface UpdateWorkAreaRequest {
  name: string;
  description?: string;
  displayOrder: number;
}

export interface CreateWorkTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  startDate?: string;
  endDate?: string;
  dueDate?: string;
}

export interface UpdateWorkTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
}

export interface CreateTaskObjectiveRequest {
  title: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateTaskObjectiveRequest {
  title?: string;
  description?: string;
  displayOrder?: number;
}

export interface CompleteTaskObjectiveRequest {
  isCompleted: boolean;
  id: string;
  workTaskId: string;
  title: string;
  description: string;
  displayOrder: string;
  completedByUserId: string;
}
