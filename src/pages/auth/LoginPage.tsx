import React from "react";
import { Box, Paper, Typography, Link } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoginForm } from "../../sections/auth";
import LoginBackground from "../../components/LoginBackground";
import { Link as RouterLink } from "react-router-dom";

const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FAFAFA 0%, #F0F0F0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // Đặt justify content thành center để căn giữa
        position: "relative",
        p: 0,
        overflow: "hidden",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {/* Hiệu ứng nền */}
      <LoginBackground />

      {/* Thanh điều hướng về trang chủ */}
      <Box
        sx={{
          position: "absolute",
          top: 30,
          left: 30,
          zIndex: 10,
        }}
      >
        <Link
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#2C2C2C",
            textDecoration: "none",
            fontWeight: 500,
            "&:hover": {
              textDecoration: "underline",
              color: "#1A1A1A",
            },
          }}
        >
          <ArrowBackIcon sx={{ mr: 1, fontSize: "0.9rem", color: "#2C2C2C" }} />
          Về trang chủ
        </Link>
      </Box>

      {/* Background Image bên phải - temporarily commented out */}
      {/* <Box
        component="img"
        src={reactLogo}
        alt="Mental health illustration"
        sx={{
          position: "absolute",
          right: { xs: 0, sm: 0, md: "5%", lg: "10%" },
          top: "50%",
          transform: "translateY(-50%)",
          height: "auto",
          maxHeight: "550px",
          maxWidth: { xs: 0, sm: 0, md: "40%", lg: "35%" },
          display: { xs: "none", sm: "none", md: "block" },
          objectFit: "contain",
          zIndex: 1,
          opacity: 0.9,
        }}
      /> */}

      {/* Form Login */}
      <Paper
        elevation={1}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          borderRadius: "16px",
          overflow: "hidden",
          maxWidth: { xs: 360, sm: 400, md: 420 },
          width: "100%",
          mx: { xs: 2, sm: 4, md: 0 }, // Thay đổi margin-left thành margin-x
          my: 4,
          boxShadow: "0px 8px 24px 0px rgba(44, 44, 44, 0.08)",
          border: "1px solid #E8DDD0",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          zIndex: 2,
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: { xs: 3, sm: 3.5, md: 4 },
            background: "linear-gradient(180deg, #FAFAFA 0%, #F8F8F8 100%)",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              fontSize={20}
              lineHeight="1.5em"
              sx={{
                letterSpacing: "0.01em",
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: "#2C2C2C",
              }}
            >
              LOGIN{" "}
              <LockOutlinedIcon
                fontSize="small"
                sx={{ ml: 0.5, fontSize: "0.9rem", color: "#2C2C2C" }}
              />
            </Typography>
          </Box>

          {/* Render the LoginForm component */}
          <LoginForm />
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
