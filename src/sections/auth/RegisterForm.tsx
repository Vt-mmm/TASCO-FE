import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Stack,
  Divider,
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
import { register } from "../../redux/auth/authSlice";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PATH_AUTH } from "../../routes/paths";
import { Role } from "../../common/enums/role.enum";

// Component Google icon giống hệt thiết kế
const GoogleIconCustom = () => (
  <Box
    component="span"
    sx={{
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      borderRadius: "50%",
      mr: 1,
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 48 48"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  </Box>
);

// Schema validation - Simplified without roleId in UI
const schema = yup.object().shape({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

// Define register form interface for UI
interface RegisterFormType {
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, errorMessage } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(
    null
  );

  // Setup react-hook-form with validation
  const methods = useForm<RegisterFormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  // Handle register form submit
  const onSubmit = async (values: RegisterFormType) => {
    // Add default User role to the form data before sending to backend
    const params = {
      data: {
        ...values,
        roleId: [Role.TASCO_USER], // Default role for all new users
      },
      navigate: navigate,
    };

    try {
      // Use the register thunk from Redux
      await dispatch(register(params)).unwrap();
      setLocalErrorMessage(null);

      // Navigation will be handled by the thunk
    } catch (error: unknown) {
      console.error("Register error:", error);
      if (typeof error === "string") {
        setLocalErrorMessage(error);
      } else if (error && typeof error === "object" && "message" in error) {
        setLocalErrorMessage((error as { message: string }).message);
      } else {
        setLocalErrorMessage("Đăng ký thất bại. Vui lòng thử lại.");
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
              <Alert severity="error" sx={{ mb: 2 }}>
                {localErrorMessage || errorMessage}
              </Alert>
            )}

            <Box>
              <Typography variant="body2" mb={1}>
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
                    placeholder="Email"
                    size="small"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      sx: {
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
                      },
                    }}
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="body2" mb={1}>
                Mật khẩu
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
                    placeholder="Mật khẩu"
                    size="small"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      sx: {
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
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

            <Box>
              <Typography variant="body2" mb={1}>
                Xác nhận mật khẩu
              </Typography>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    required
                    placeholder="Xác nhận mật khẩu"
                    size="small"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      sx: {
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
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
                bgcolor: "black",
                borderRadius: 6,
                fontWeight: 500,
                py: 1.2,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.8)",
                },
              }}
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>

            <Box sx={{ position: "relative", py: 1.5 }}>
              <Divider />
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(229, 249, 244, 0.7)",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Or
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<GoogleIconCustom />}
              sx={{
                borderRadius: 30,
                fontWeight: 500,
                py: 1.2,
                textTransform: "none",
                backgroundColor: "#4A4A77",
                color: "white",
                boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)",
                "&:hover": {
                  backgroundColor: "#3F3F66",
                },
              }}
              fullWidth
            >
              Đăng ký với Google
            </Button>
          </Stack>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography fontSize={14} mb={1.5}>
            Đã có tài khoản?{" "}
            <Link
              component={RouterLink}
              to={PATH_AUTH.login}
              underline="hover"
              fontWeight={600}
              color="primary"
            >
              ĐĂNG NHẬP
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
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Trở về Trang chủ
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default RegisterForm;
