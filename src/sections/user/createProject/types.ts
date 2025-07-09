// Shared types for Create Project components
export interface CreateProjectFormData {
  name: string;
  description: string;
  ownerId: string;
}

export interface UserAuth {
  username?: string;
  email?: string;
  userId?: string;
}

export interface ProjectFormComponentProps {
  isCreating: boolean;
  userAuth: UserAuth | null;
}
