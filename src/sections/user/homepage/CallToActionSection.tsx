import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PATH_AUTH, PATH_USER } from "../../../routes/paths";
import { useAppSelector } from "../../../redux/configStore";
import { getAccessToken } from "../../../utils";

const CallToActionSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const accessToken = getAccessToken();

  return (
    <Box
      id="call-to-action-section"
      sx={{
        backgroundColor: "#F5F0E8",
        py: { xs: 8, md: 10 },
        mb: { xs: 4, md: 6 }, // Add bottom margin to separate from footer
        border: "none", // Explicitly remove any border
        boxShadow: "none", // Remove any shadow
        outline: "none", // Remove any outline
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          border: "none",
          outline: "none",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
            justifyContent: "space-between",
            border: "none",
            outline: "none",
            boxShadow: "none",
          }}
        >
          {/* Left Content */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              pr: { md: 2 }, // Match Hero Section spacing
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "#666666",
                fontSize: { xs: "0.8rem", md: "0.9rem" },
                fontWeight: 500,
                mb: 1,
              }}
            >
              Tasco
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: { xs: 2, md: 3 },
                color: "#2C2C2C",
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
                lineHeight: 1.2,
              }}
            >
              Tính năng nổi bật của Tasco
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: { xs: 3, md: 4 },
                color: "#666666",
                lineHeight: 1.6,
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Tasco giúp quản lý công việc nhóm hiệu quả và dễ dàng. Với giao
              diện hiện đại, bạn có thể theo dõi tiến độ và phân công nhiệm vụ
              một cách trực quan.
            </Typography>

            <Box sx={{ mb: { xs: 4, md: 5 } }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: "#2C2C2C",
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                  }}
                >
                  Quản lý thông minh
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666666",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    lineHeight: 1.5,
                  }}
                >
                  Tasco giúp bạn tổ chức công việc một cách khoa học và hiệu quả
                  hơn.
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: "#2C2C2C",
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                  }}
                >
                  Giao diện thân thiện
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666666",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    lineHeight: 1.5,
                  }}
                >
                  Giao diện dễ sử dụng, phù hợp với mọi đối tượng người dùng.
                </Typography>
              </Box>
            </Box>

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
                  backgroundColor: "white",
                  color: "#2C2C2C",
                  border: "1px solid #E0E0E0",
                  px: { xs: 3, md: 4 },
                  py: { xs: 1.2, md: 1.5 },
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  fontWeight: 500,
                  borderRadius: 25, // More rounded like in the image
                  textTransform: "none",
                  minWidth: "auto",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  "&:hover": {
                    backgroundColor: "#F8F8F8",
                    border: "1px solid #D0D0D0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                }}
              >
                Khám Phá
              </Button>
              {/* Only show register button for non-authenticated users */}
              {!isAuthenticated && !accessToken && (
                <Button
                  variant="text"
                  size="large"
                  onClick={() => navigate(PATH_AUTH.register)}
                  sx={{
                    color: "#2C2C2C",
                    px: { xs: 4, md: 3 },
                    py: { xs: 1.8, md: 1.5 },
                    fontSize: { xs: "1.1rem", md: "1rem" },
                    fontWeight: 500,
                    textTransform: "none",
                    minWidth: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      backgroundColor: "transparent",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Đăng Ký →
                </Button>
              )}
            </Box>
          </Box>

          {/* Right Content - Placeholder for image */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              pl: { md: 2 }, // Match Hero Section spacing
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
                  top: "40%",
                  left: "40%",
                  transform: "translate(-50%, -50%)",
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  backgroundColor: "#D4C4B0",
                  borderRadius: 2,
                  opacity: 0.8,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "25%",
                  right: "25%",
                  width: { xs: 40, md: 50 },
                  height: { xs: 40, md: 50 },
                  backgroundColor: "#D4C4B0",
                  borderRadius: 1,
                  opacity: 0.6,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: "25%",
                  left: "20%",
                  width: { xs: 60, md: 70 },
                  height: { xs: 60, md: 70 },
                  backgroundColor: "#D4C4B0",
                  borderRadius: 1.5,
                  opacity: 0.7,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: "40%",
                  right: "35%",
                  width: { xs: 30, md: 40 },
                  height: { xs: 30, md: 40 },
                  backgroundColor: "#C0B09A",
                  borderRadius: 0.5,
                  opacity: 0.5,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CallToActionSection;
