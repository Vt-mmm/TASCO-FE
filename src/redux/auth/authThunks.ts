import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../axiosClient/axiosClient";
import { LoginForm, Params } from "../../common/types";
import { Role } from "../../common/enums/role.enum";
import { UserAuth, AccountInfo } from "../../common/models";
import { ApiResponse } from "../../common/types/common";
import {
  ROUTES_API_AUTH,
  ROUTES_API_ACCOUNTS,
} from "../../constants/routesApiKeys";
import { PATH_AUTH, PATH_ADMIN, PATH_USER } from "../../routes/paths";
import {
  /* getAccessToken, */ // Commenting out unused import
  handleResponseMessage,
  removeAuthenticated,
  removeSession,
  setAccessToken,
  setAuthenticated,
  setRefreshToken,
  setUserAuth,
} from "../../utils";

// Define local action creator functions instead of importing from the slice
// This breaks the circular dependency
const setMessageSuccess = (message: string) => ({
  type: "auth/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "auth/setMessageError",
  payload: message,
});

const setStatus = () => ({
  type: "auth/setStatus",
});

// Define a type for the API response based on what we expect to receive
interface ApiUserResponse {
  userId?: string;
  id?: string;
  email: string;
  fullName?: string;
  username?: string;
  roles?: string[];
  role?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

// Define API Error Response interface for consistent error handling
interface ApiErrorResponse {
  success: boolean;
  message?: string;
  data?: null;
  errors?: string[];
}

// Define RegisterForm interface - Updated to match backend requirements
interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: string[];
}

// Hàm helper để đảm bảo người dùng có vai trò cần thiết
const ensureUserRoles = (roles?: string[] | null): string[] => {
  if (!roles || roles.length === 0) {
    return [Role.TASCO_USER]; // Thêm vai trò User mặc định nếu không có vai trò nào
  }

  // Kiểm tra nếu mảng roles chỉ chứa giá trị null, undefined, hoặc chuỗi rỗng
  if (roles.every((role) => !role)) {
    return [Role.TASCO_USER];
  }

  return roles;
};

// Login thunk
export const loginThunk = createAsyncThunk<
  UserAuth,
  Params<LoginForm>,
  { rejectValue: string }
>("auth/login", async (params, thunkAPI) => {
  // Safely extract data from params with a default empty object
  const data: Partial<LoginForm> = params?.data || {};
  const navigate = params?.navigate;

  try {
    const apiResponse = await axiosClient.post<ApiUserResponse>(
      ROUTES_API_AUTH.LOGIN,
      data
    );

    // The response is directly in apiResponse.data
    const response = apiResponse.data;

    // If we're still getting undefined, try accessing apiResponse directly
    if (!response) {
      // Try to extract data directly from the response if necessary
      // This is a fallback for unusual API response structures
      const directResponse = apiResponse as unknown as ApiUserResponse;

      if (directResponse.userId || directResponse.id) {
        // Đảm bảo vai trò User
        const userRoles = ensureUserRoles(
          directResponse.roles ||
            (directResponse.role ? [directResponse.role] : null)
        );

        // The data is directly in apiResponse
        const userStorage: UserAuth = {
          userId: directResponse.userId || directResponse.id || "",
          username:
            directResponse.fullName ||
            directResponse.username ||
            directResponse.email,
          email: directResponse.email,
          roles: userRoles,
          authProvider: "password",
        };

        if (directResponse.tokens) {
          setAccessToken(directResponse.tokens.accessToken);
          setRefreshToken(directResponse.tokens.refreshToken);
        } else if (directResponse.accessToken) {
          setAccessToken(directResponse.accessToken);
          setRefreshToken(directResponse.refreshToken || "");
        }

        setUserAuth(userStorage);
        setAuthenticated();
        const message = handleResponseMessage("Login successful.");
        thunkAPI.dispatch(setMessageSuccess(message));

        // Navigate based on user role if a navigator is provided
        if (navigate) {
          if (userRoles.includes(Role.TASCO_ADMIN)) {
            // Using window.location.href for a "hard" navigation to avoid React Router confusion
            window.location.href = PATH_ADMIN.dashboard;
          } else {
            navigate(PATH_USER.homepage);
          }
        }

        return userStorage;
      }
      throw new Error("Cannot find user data in response");
    }

    // Validate required fields in the response
    const userId = response.userId || response.id;
    // Đảm bảo vai trò User
    const userRoles = ensureUserRoles(
      response.roles || (response.role ? [response.role] : null)
    );
    const email = response.email;
    const username = response.fullName || response.username || response.email;
    const tokens = response.tokens || {
      accessToken: response.accessToken || "",
      refreshToken: response.refreshToken || "",
    };

    if (!userId || !email || !tokens.accessToken) {
      throw new Error("Invalid response format from API");
    }

    const userStorage: UserAuth = {
      userId,
      username,
      email,
      roles: userRoles,
      authProvider: "password",
    };

    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUserAuth(userStorage);
    setAuthenticated();
    const message = handleResponseMessage("Login successful.");
    thunkAPI.dispatch(setMessageSuccess(message));

    // Navigate based on user role if a navigator is provided
    if (navigate) {
      if (userRoles.includes(Role.TASCO_ADMIN)) {
        // Using window.location.href for a "hard" navigation to avoid React Router confusion
        window.location.href = PATH_ADMIN.dashboard;
      } else {
        navigate(PATH_USER.homepage);
      }
    }

    return userStorage;
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: ApiErrorResponse;
      };
      message?: string;
    };

    // Extract specific error messages from backend response
    let errorMessage = "Invalid username or password. Please try again!";

    if (err.response?.data) {
      const { message, errors } = err.response.data;

      if (errors && errors.length > 0) {
        // Use the first specific error from the errors array
        errorMessage = errors[0];

        // Handle common login error patterns
        if (errorMessage.includes("Invalid credentials")) {
          errorMessage = "Tên đăng nhập hoặc mật khẩu không chính xác.";
        } else if (errorMessage.includes("Account not found")) {
          errorMessage = "Tài khoản không tồn tại.";
        } else if (errorMessage.includes("Account locked")) {
          errorMessage =
            "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.";
        } else if (errorMessage.includes("Email not confirmed")) {
          errorMessage = "Vui lòng xác nhận email trước khi đăng nhập.";
        }
      } else if (message) {
        // Fallback to general message if no specific errors
        if (message.includes("Login failed")) {
          errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra thông tin.";
        } else {
          errorMessage = message;
        }
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Register thunk
export const registerThunk = createAsyncThunk<
  void,
  Params<RegisterForm>,
  { rejectValue: string }
>("auth/register", async (params, thunkAPI) => {
  // Safely extract data from params with a default empty object
  const data: Partial<RegisterForm> = params?.data || {};
  const navigate = params?.navigate;

  try {
    // Transform data to match backend expectations
    if (data && typeof data === "object") {
      const { confirmPassword, ...otherData } = data as RegisterForm;

      // Map frontend field names to backend field names (backend expects PascalCase)
      const registerData = {
        Email: otherData.email,
        Password: otherData.password,
        ConfirmPassword: confirmPassword,
        FullName: otherData.fullName,
        RoleId: otherData.roleId,
      };

      await axiosClient.post(ROUTES_API_AUTH.REGISTER, registerData);

      const message = handleResponseMessage(
        "Registration successful. Please check your email to confirm your account."
      );
      thunkAPI.dispatch(setMessageSuccess(message));

      // Navigate to login page after successful registration
      if (navigate) {
        navigate(PATH_AUTH.login);
      }
    } else {
      throw new Error("Invalid registration data");
    }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        data?: ApiErrorResponse;
        status?: number;
      };
      message?: string;
    };

    // Extract specific error messages from backend response
    let errorMessage = "Registration failed. Please try again!";

    if (axiosError?.response?.data) {
      const { message, errors } = axiosError.response.data;

      if (errors && Array.isArray(errors) && errors.length > 0) {
        // Use the first specific error from the errors array
        errorMessage = errors[0];

        // Handle common error patterns and make them more user-friendly
        if (
          errorMessage.toLowerCase().includes("username") &&
          errorMessage.toLowerCase().includes("already taken")
        ) {
          errorMessage =
            "Tên người dùng đã được sử dụng. Vui lòng chọn tên khác.";
        } else if (
          errorMessage.toLowerCase().includes("username") &&
          errorMessage.toLowerCase().includes("invalid")
        ) {
          errorMessage =
            "Tên người dùng không hợp lệ. Chỉ được sử dụng chữ cái và số.";
        } else if (
          errorMessage.toLowerCase().includes("email") &&
          (errorMessage.toLowerCase().includes("already exists") ||
            errorMessage.toLowerCase().includes("already"))
        ) {
          errorMessage = "Email đã được đăng ký. Vui lòng sử dụng email khác.";
        } else if (errorMessage.toLowerCase().includes("password")) {
          errorMessage = "Mật khẩu không đáp ứng yêu cầu bảo mật.";
        }
      } else if (message) {
        // Fallback to general message if no specific errors
        if (message.includes("User registration failed")) {
          errorMessage =
            "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.";
        } else {
          errorMessage = message;
        }
      }
    } else if (axiosError?.message) {
      errorMessage = axiosError.message;
    }

    // Don't use handleResponseMessage for already processed error messages
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Logout thunk
export const logoutThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, thunkAPI) => {
  try {
    // Clear auth data
    removeAuthenticated();
    removeSession();
    localStorage.clear();

    // Reset interceptor state and clean up axios
    try {
      const { resetInterceptorState } = await import(
        "../../axiosClient/setupClientInterceptors"
      );
      resetInterceptorState();
    } catch (/* eslint-disable @typescript-eslint/no-unused-vars */ _error /* eslint-enable */) {
      // Error handling silently preserved
    }

    // Reset app state
    thunkAPI.dispatch(setStatus());

    // Reset all related slices
    thunkAPI.dispatch({ type: "psychologist/resetPsychologistState" });
    thunkAPI.dispatch({ type: "package/resetPackageState" });
    thunkAPI.dispatch({ type: "user/resetUser" });
    thunkAPI.dispatch({ type: "appointment/resetAppointmentState" });
    thunkAPI.dispatch({ type: "payment/resetPaymentState" });
    thunkAPI.dispatch({ type: "usertest/resetUserTestState" });

    // Đảm bảo xóa headers của axios instances
    try {
      const { resetAuthHeaders } = await import(
        "../../axiosClient/axiosClient"
      );
      resetAuthHeaders();
    } catch (/* eslint-disable @typescript-eslint/no-unused-vars */ _err /* eslint-enable */) {
      // Ignore errors
    }
  } catch (/* eslint-disable @typescript-eslint/no-unused-vars */ _error /* eslint-enable */) {
    return thunkAPI.rejectWithValue("Logout failed");
  }
});

// Get User Info thunk
export const getUserInfoThunk = createAsyncThunk<
  AccountInfo,
  void,
  { rejectValue: string }
>("auth/getUserInfo", async (_, { rejectWithValue }) => {
  try {
    // The interceptor returns the response body, which we type as ApiResponse.
    const response = (await axiosClient.get(
      ROUTES_API_ACCOUNTS.GET_INFO
    )) as ApiResponse<AccountInfo>;

    if (response && response.success) {
      return response.data;
    }

    throw new Error(response?.message || "Invalid response from server");
  } catch (error) {
    const err = error as {
      response?: {
        data?: ApiErrorResponse;
      };
      message?: string;
    };

    // Extract specific error messages from backend response
    let errorMessage = "An unknown error occurred";

    if (err?.response?.data) {
      const { message, errors } = err.response.data;

      if (errors && errors.length > 0) {
        // Use the first specific error from the errors array
        errorMessage = errors[0];
      } else if (message) {
        errorMessage = message;
      }
    } else if (err?.message) {
      errorMessage = err.message;
    }

    return rejectWithValue(errorMessage);
  }
});
