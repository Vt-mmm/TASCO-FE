// Re-export task-related interfaces from workArea.ts
export type {
  WorkTask,
  TaskObjective,
  CreateWorkTaskRequest,
  UpdateWorkTaskRequest,
  CreateTaskObjectiveRequest,
  UpdateTaskObjectiveRequest,
} from "./workArea";

// Additional request models to match backend API
export interface CreateWorkTaskApiRequest {
  Title: string;
  Description?: string;
  Priority?: string;
  DueDate?: string;
  Status?: string;
}

export interface UpdateWorkTaskApiRequest {
  Title?: string;
  Description?: string;
  Status?: string;
  Priority?: string;
  StartDate?: string;
  EndDate?: string;
  DueDate?: string;
}

// Task status and priority enums to match backend
export enum TaskStatus {
  NEW = "NEW",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
  COMPLETED = "COMPLETED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}
