import React from "react";
import { Box, Container, Typography, Button, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PATH_AUTH, PATH_USER } from "../../../routes/paths";
import { useAppSelector } from "../../../redux/configStore";
import { getAccessToken } from "../../../utils";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const accessToken = getAccessToken();
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: { xs: "auto", md: "100vh" },
        display: "flex",
        alignItems: "center",
        pt: { xs: 10, md: 12 }, // More padding top for mobile
        pb: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left Content - Text */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              order: { xs: 1, md: 1 },
              pr: { md: 2 }, // Add padding right for desktop spacing
              textAlign: "left", // Always align text to left for consistency
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: { xs: 2, md: 3 },
                fontSize: {
                  xs: "2rem",
                  sm: "2.5rem",
                  md: "3.5rem",
                  lg: "4rem",
                },
                color: "#2C2C2C",
                lineHeight: { xs: 1.3, md: 1.2 },
              }}
            >
              Quản lý công việc nhóm hiệu quả với Tasco
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 3, md: 4 },
                color: "#666666",
                maxWidth: { xs: "100%", md: 500 },
                fontSize: { xs: "1rem", md: "1.2rem" },
                lineHeight: 1.6,
              }}
            >
              Tasco mang đến một giao diện hiện đại và dễ sử dụng, giúp bạn quản
              lý công việc nhóm một cách linh hoạt và hiệu quả. Với các tính
              năng nổi bật, bạn có thể theo dõi tiến độ dự án và phân công nhiệm
              vụ một cách dễ dàng.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, md: 2 },
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: { xs: "stretch", sm: "flex-start" },
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  // Navigate based on authentication status
                  if (isAuthenticated && accessToken) {
                    navigate(PATH_USER.dashboard); // Navigate to dashboard for authenticated users
                  } else {
                    // Scroll to features section for non-authenticated users
                    const featuresElement =
                      document.getElementById("features-section");
                    if (featuresElement) {
                      featuresElement.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                sx={{
                  bgcolor: "#2C2C2C",
                  color: "white",
                  px: { xs: 3, md: 4 },
                  py: { xs: 1.5, md: 1.8 },
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  fontWeight: 500,
                  borderRadius: 2,
                  textTransform: "none",
                  minWidth: { xs: "100%", sm: "auto" },
                  maxWidth: "fit-content",
                  "&:hover": {
                    bgcolor: "#1A1A1A",
                  },
                }}
              >
                Tìm hiểu
              </Button>
              {/* Only show register button for non-authenticated users */}
              {!isAuthenticated && !accessToken && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(PATH_AUTH.register)}
                  sx={{
                    borderColor: "#2C2C2C",
                    color: "#2C2C2C",
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 1.8 },
                    fontSize: { xs: "1rem", md: "1.1rem" },
                    fontWeight: 500,
                    borderRadius: 2,
                    textTransform: "none",
                    minWidth: { xs: "100%", sm: "auto" },
                    maxWidth: "fit-content",
                    "&:hover": {
                      borderColor: "#2C2C2C",
                      bgcolor: "rgba(44, 44, 44, 0.04)",
                    },
                  }}
                >
                  Đăng ký
                </Button>
              )}
            </Box>
          </Box>

          {/* Right Content - Image */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              order: { xs: 2, md: 2 },
              pl: { md: 2 }, // Add padding left for desktop spacing
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: { xs: 280, sm: 350, md: 400 },
                backgroundColor: "#E8DDD0",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                mt: { xs: 2, md: 0 },
              }}
            >
              {/* Placeholder squares for design */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 120,
                  height: 120,
                  backgroundColor: "#D4C4B0",
                  borderRadius: 2,
                  opacity: 0.7,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "30%",
                  right: "20%",
                  width: 60,
                  height: 60,
                  backgroundColor: "#D4C4B0",
                  borderRadius: 1,
                  opacity: 0.5,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: "20%",
                  left: "15%",
                  width: 80,
                  height: 80,
                  backgroundColor: "#D4C4B0",
                  borderRadius: 1.5,
                  opacity: 0.6,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
