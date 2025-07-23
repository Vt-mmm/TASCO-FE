import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UserAuth, UserInfo, AccountInfo } from "../../common/models";
import { toast } from "react-toastify";
import {
  getAuthenticated,
  getEmailVerify,
  getUserAuth,
  getUserInfo,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setAuthenticated,
  setEmailVerify,
  setRefreshToken,
  setUserAuth as setUserAuthUtil,
  clearAuthData,
} from "../../utils";
import {
  loginThunk,
  logoutThunk,
  registerThunk,
  getUserInfoThunk,
} from "../../redux/auth/authThunks";

export interface AuthState {
  isLogout: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isAuthenticated: boolean;
  message: string;
  status: string;
  email: string;
  userAuth: UserAuth | null;
  userInfo: UserInfo | null;
  accountInfo: AccountInfo | null;
  errorMessage: string | null;
}

const getUserInStorage = getUserAuth() || null;
const getUserInfoInStorage = getUserInfo() || null;
const getIsAuthenticated = getAuthenticated() || false;
const getEmailInStorage = getEmailVerify() || "";

const initialState: AuthState = {
  isLogout: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  isAuthenticated: getIsAuthenticated,
  message: "",
  status: "",
  email: getEmailInStorage,
  userAuth: getUserInStorage,
  userInfo: getUserInfoInStorage,
  accountInfo: null,
  errorMessage: null,
};

// Don't redeclare the thunks here, use them directly from authThunks.ts
// These lines were causing the type error
// export const login = createAsyncThunk("auth/login", loginThunk);
// export const logout = createAsyncThunk("auth/logout", logoutThunk);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMessageSuccess: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
      toast.success(state.message);
    },
    setMessageError: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
      toast.error(state.message);
    },
    setStatus: (state) => {
      state.status = "";
    },
    setEmail: (state, action: PayloadAction<{ email: string }>) => {
      state.email = action.payload?.email;
      setEmailVerify(action.payload?.email);
    },
    setUserAuth: (state, action: PayloadAction<UserAuth>) => {
      state.userAuth = action.payload;
      setUserAuthUtil(action.payload);
    },
    setUserInfo: (state, action: PayloadAction<UserAuth>) => {
      state.userAuth = action.payload;
      setUserAuthUtil(action.payload);
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (action.payload) {
        setAuthenticated();
      }
    },
    setIsLogout: (state, action: PayloadAction<boolean>) => {
      state.isLogout = action.payload;
    },
    updateLocalAccessToken: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      setAccessToken(action.payload.accessToken);
      setRefreshToken(action.payload.refreshToken);
    },
    removeToken: () => {
      removeAccessToken();
      removeRefreshToken();
    },
    resetAuth: () => {
      // Clean up all auth data
      clearAuthData();

      // Reset state to initial values with auth fields cleared
      return {
        ...initialState,
        isAuthenticated: false,
        userAuth: null,
        userInfo: null,
        accountInfo: null,
        email: "",
        isLogout: true,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.userAuth = action.payload;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.isAuthenticated = false;
      })

      // Add register thunk cases
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload as string;
      })

      // Add Google login cases

      .addCase(getUserInfoThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
        console.log("getUserInfoThunk.pending - state reset");
      })
      .addCase(getUserInfoThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.accountInfo = action.payload;
        state.errorMessage = null;
        console.log(
          "getUserInfoThunk.fulfilled - accountInfo set:",
          action.payload
        );
      })
      .addCase(getUserInfoThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload as string;
        console.log("getUserInfoThunk.rejected - error:", action.payload);
      })

      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
        state.isAuthenticated = false;
        state.userAuth = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.isAuthenticated = false;
        state.userAuth = null;
        state.isLogout = true;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
  },
});

export const {
  setMessageSuccess,
  setMessageError,
  setEmail,
  setUserAuth,
  setUserInfo,
  setIsAuthenticated,
  setIsLogout,
  updateLocalAccessToken,
  removeToken,
  setStatus,
  resetAuth,
} = authSlice.actions;

// Export the thunks directly from the authThunks file for use elsewhere
export {
  loginThunk as login,
  logoutThunk as logout,
  registerThunk as register,
  getUserInfoThunk as getUserInfo,
};

const authReducer = authSlice.reducer;

export default authReducer;
