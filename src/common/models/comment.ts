export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;        // Backend trả về userId
  userName: string;      // Backend trả về userName
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;    // Backend trả về isDeleted
}

export interface CreateCommentRequest {
  taskId: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
 