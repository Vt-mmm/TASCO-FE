import { axiosClient } from "../axiosClient/axiosClient";
import { ROUTES_API_ACCOUNTS } from "../constants/routesApiKeys";

interface UserInfo {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Cache để lưu thông tin user, tránh gọi API nhiều lần
const userCache = new Map<string, UserInfo>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 phút
const cacheTimestamps = new Map<string, number>();

// Store current user info
let currentUserInfo: UserInfo | null = null;

/**
 * Lấy thông tin current user từ API và cache
 */
export const getCurrentUserInfo = async (): Promise<UserInfo | null> => {
  try {
    // Check cache first
    if (currentUserInfo) {
      const timestamp = cacheTimestamps.get(currentUserInfo.userId);
      if (timestamp && Date.now() - timestamp < CACHE_EXPIRY) {
        return currentUserInfo;
      }
    }

    const response = await axiosClient.post<ApiResponse<UserInfo>>(
      ROUTES_API_ACCOUNTS.GET_INFO
    );

    if (response.data.success && response.data.data) {
      currentUserInfo = response.data.data;

      // Cache thông tin
      userCache.set(currentUserInfo.userId, currentUserInfo);
      cacheTimestamps.set(currentUserInfo.userId, Date.now());

      return currentUserInfo;
    }

    return null;
  } catch (error) {
    console.error("Error fetching current user info:", error);
    return null;
  }
};

/**
 * Lấy display name của user với logic thông minh
 */
export const getUserDisplayName = async (
  userId: string,
  providedUserName?: string
): Promise<string> => {
  // 1. Nếu có username được provide từ backend response
  if (providedUserName && providedUserName.trim() !== "") {
    return providedUserName.trim();
  }

  // 2. Nếu là current user, lấy từ API
  try {
    const currentUser = await getCurrentUserInfo();
    if (currentUser && currentUser.userId === userId) {
      return currentUser.fullName || currentUser.email || `User ${userId}`;
    }
  } catch {
    // Silent fail, continue to fallback
  }

  // 3. Fallback về User ID với format ngắn gọn hơn
  const shortId = userId.length > 8 ? userId.substring(0, 8) + "..." : userId;
  return `User ${shortId}`;
};

/**
 * Clear cache (khi user logout)
 */
export const clearUserCache = (): void => {
  userCache.clear();
  cacheTimestamps.clear();
  currentUserInfo = null;
};

/**
 * Lấy current user ID từ cache
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const userInfo = await getCurrentUserInfo();
  return userInfo?.userId || null;
};

/**
 * Check xem userId có phải là current user không
 */
export const isCurrentUser = async (userId: string): Promise<boolean> => {
  const currentUserId = await getCurrentUserId();
  return currentUserId === userId;
};
