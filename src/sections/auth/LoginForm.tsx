import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HomeIcon from "@mui/icons-material/Home";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/configStore";
import { login, setIsLogout } from "../../redux/auth/authSlice";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PATH_AUTH } from "../../routes/paths";

// Schema validation
const schema = yup.object().shape({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
});

// Define login form interface
interface LoginFormType {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, errorMessage, isAuthenticated, userAuth } = useAppSelector(
    (state) => state.auth
  );
  const [showPassword, setShowPassword] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(
    null
  );

  // Log auth state whenever it changes
  useEffect(() => {
    // If authenticated, navigate to the homepage
    if (isAuthenticated && userAuth) {
      // User is authenticated, navigation happens automatically
    }
  }, [isAuthenticated, userAuth]);

  // Setup react-hook-form with validation
  const methods = useForm<LoginFormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  // Handle login form submit
  const onSubmit = async (values: LoginFormType) => {
    const params = {
      data: { ...values },
      navigate: navigate, // Pass the navigate function to the thunk
    };

    try {
      await dispatch(login(params)).unwrap();
      dispatch(setIsLogout(false));
      setLocalErrorMessage(null);

      // The thunk will handle navigation to user homepage after successful login
    } catch (error: unknown) {
      // Error handling without console logging
      // Lưu message lỗi vào state để hiển thị
      if (typeof error === "string") {
        setLocalErrorMessage(error);
      } else if (error && typeof error === "object" && "message" in error) {
        setLocalErrorMessage(error.message as string);
      } else {
        setLocalErrorMessage("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            {(localErrorMessage || errorMessage) && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                  border: "1px solid rgba(244, 67, 54, 0.2)",
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    color: "#d32f2f",
                  },
                  "& .MuiAlert-message": {
                    color: "#2C2C2C",
                    fontWeight: 500,
                  }
                }}
              >
                {localErrorMessage || errorMessage}
              </Alert>
            )}

            <Box>
              <Typography 
                variant="body2" 
                mb={1}
                sx={{ 
                  color: "#2C2C2C",
                  fontWeight: 500 
                }}
              >
                Email
              </Typography>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    fullWidth
                    required
                    placeholder="Nhập email của bạn"
                    size="small"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E8DDD0",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "&:hover": {
                          backgroundColor: "#F8F8F8",
                          borderColor: "#D4C4B0",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#FFFFFF",
                          borderColor: "#2C2C2C",
                          boxShadow: "0 0 0 2px rgba(44, 44, 44, 0.1)",
                        },
                      },
                    }}
                  />
                )}
              />
            </Box>

            <Box>
              <Typography 
                variant="body2" 
                mb={1}
                sx={{ 
                  color: "#2C2C2C",
                  fontWeight: 500 
                }}
              >
                Mật Khẩu
              </Typography>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    required
                    placeholder="Nhập mật khẩu của bạn"
                    size="small"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E8DDD0",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "&:hover": {
                          backgroundColor: "#F8F8F8",
                          borderColor: "#D4C4B0",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#FFFFFF",
                          borderColor: "#2C2C2C",
                          boxShadow: "0 0 0 2px rgba(44, 44, 44, 0.1)",
                        },
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: "#666666" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              endIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArrowForwardIcon />
                )
              }
              sx={{
                bgcolor: "#2C2C2C",
                borderRadius: 2,
                fontWeight: 600,
                py: 1.5,
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(44, 44, 44, 0.15)",
                "&:hover": {
                  bgcolor: "#1A1A1A",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(44, 44, 44, 0.2)",
                },
                "&:disabled": {
                  bgcolor: "#D4C4B0",
                  color: "#666666",
                },
                transition: "all 0.25s ease",
              }}
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <Link
              component={RouterLink}
              to={PATH_AUTH.forgotPassword}
              underline="hover"
              sx={{
                textAlign: "center",
                fontSize: 14,
                color: "#666666",
                mt: 1,
                "&:hover": {
                  color: "#2C2C2C",
                },
              }}
            >
              Quên mật khẩu?
            </Link>
          </Stack>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography 
            fontSize={14} 
            mb={1.5}
            sx={{ color: "#666666" }}
          >
            Chưa có tài khoản?{" "}
            <Link
              component={RouterLink}
              to="/auth/register"
              underline="hover"
              fontWeight={600}
              sx={{ 
                color: "#2C2C2C",
                "&:hover": {
                  color: "#1A1A1A",
                }
              }}
            >
              Đăng Ký
            </Link>
          </Typography>

          <Button
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
            variant="text"
            size="small"
            sx={{
              fontSize: 13,
              textTransform: "none",
              color: "#666666",
              "&:hover": {
                backgroundColor: "rgba(44, 44, 44, 0.04)",
                color: "#2C2C2C",
              },
            }}
          >
            Về trang chủ
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default LoginForm;
