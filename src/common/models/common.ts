import { Comment } from './comment';

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode?: number;
}

// Response structure that matches backend controller
export interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Paginated comments response from backend - flexible structure
export interface PaginatedCommentsResponse {
  comments?: Comment[];  // Optional in case backend returns different structure
  totalCount?: number;
  pageCount?: number;
  currentPage?: number;
  pageSize?: number;
  // In case backend returns array directly
  data?: Comment[];
  // Or if it's just an array of comments
  items?: Comment[];
}

export interface ErrorResponse {
  message: string;
  errors?: { [key: string]: string[] };
  statusCode: number;
}
