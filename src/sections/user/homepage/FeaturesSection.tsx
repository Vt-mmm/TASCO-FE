import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Notifications as NotificationIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PATH_AUTH, PATH_USER } from "../../../routes/paths";
import { useAppSelector } from "../../../redux/configStore";
import { getAccessToken } from "../../../utils";

const FeaturesSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const accessToken = getAccessToken();

  const features = [
    {
      icon: (
        <CheckIcon sx={{ fontSize: { xs: 56, md: 64 }, color: "#2C2C2C" }} />
      ),
      title: "Dễ dàng theo dõi tiến độ và phân công nhiệm vụ trong nhóm.",
      description:
        "Tasco giúp bạn tổ chức công việc một cách trực quan và hiệu quả.",
      link: "Tìm hiểu",
    },
    {
      icon: (
        <NotificationIcon
          sx={{ fontSize: { xs: 56, md: 64 }, color: "#2C2C2C" }}
        />
      ),
      title: "Tính năng thông báo giúp bạn không bỏ lỡ bất kỳ cập nhật nào.",
      description: "Nhận thông báo ngay lập tức về các thay đổi trong dự án.",
      link: "Đăng ký",
    },
    {
      icon: (
        <PeopleIcon sx={{ fontSize: { xs: 56, md: 64 }, color: "#2C2C2C" }} />
      ),
      title: "Giao diện thân thiện, dễ sử dụng cho mọi thành viên trong nhóm.",
      description:
        "Tạo điều kiện thuận lợi cho sự hợp tác và giao tiếp giữa các thành viên.",
      link: "Bắt đầu",
    },
  ];

  return (
    <Box
      id="features-section"
      sx={{ py: { xs: 10, md: 12 }, bgcolor: "#FAFAFA" }}
    >
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          // Ensure same padding as Hero Section for alignment
        }}
      >
        <Typography
          variant="h2"
          component="h2"
          textAlign="left" // Change to left align for consistency
          sx={{
            fontWeight: 700,
            mb: { xs: 6, md: 8 },
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
            color: "#2C2C2C",
            lineHeight: 1.3,
            maxWidth: { xs: "100%", md: "900px" },
            px: { xs: 2, md: 0 },
            // Position to align with first card
            ml: { md: 0 }, // No left margin on desktop
          }}
        >
          Tasco: Giải pháp tối ưu cho quản lý công việc nhóm hiệu quả.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            mt: { xs: 2, md: 4 },
            alignItems: "stretch", // Ensure all cards have same height
            px: { xs: 2, md: 0 }, // Add padding for mobile
            // Create precise alignment with Hero Section layout
            justifyContent: "space-between",
            // Each card takes equal width (33.33% each)
            "& > *": {
              flex: { xs: "1 1 auto", md: "1 1 0%" },
            },
          }}
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                textAlign: "left", // Change to left align for consistency
                p: { xs: 3, md: 4 },
                border: "1px solid transparent",
                borderRadius: 3,
                transition: "all 0.3s ease",
                backgroundColor: "white",
                display: "flex",
                flexDirection: "column",
                height: "100%", // Ensure all cards have same height
                minHeight: { xs: "auto", md: "400px" }, // Set minimum height for desktop
                "&:hover": {
                  borderColor: "#E0E0E0",
                  backgroundColor: "#FAFAFA",
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Box
                sx={{
                  mb: { xs: 3, md: 4 },
                  display: "flex",
                  justifyContent: "flex-start", // Align icon to left
                }}
              >
                {feature.icon}
              </Box>
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  color: "#2C2C2C",
                  fontSize: { xs: "1.25rem", md: "1.3rem" },
                  lineHeight: 1.3,
                  height: { md: "4em" }, // Fixed height for title
                  display: "flex",
                  alignItems: "flex-start", // Align to top-left
                  justifyContent: "flex-start", // Align to left
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body1"
                color="#666666"
                sx={{
                  mb: { xs: 3, md: 4 },
                  lineHeight: 1.6,
                  fontSize: { xs: "1rem", md: "1rem" },
                  height: { md: "4.5em" }, // Fixed height for description
                  display: "flex",
                  alignItems: "flex-start", // Align to top-left
                  justifyContent: "flex-start", // Align to left
                  flexGrow: 1, // Take remaining space
                }}
              >
                {feature.description}
              </Typography>
              <Box sx={{ mt: "auto" }}>
                {" "}
                {/* Push button to bottom */}
                <Button
                  variant="text"
                  sx={{
                    color: "#2C2C2C",
                    textTransform: "none",
                    fontSize: { xs: "1rem", md: "1rem" },
                    fontWeight: 600,
                    p: { xs: 1, md: 1.5 },
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: "rgba(44, 44, 44, 0.04)",
                      transform: "translateX(4px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    if (feature.link === "Đăng ký") {
                      if (isAuthenticated && accessToken) {
                        // If authenticated, navigate to dashboard
                        navigate(PATH_USER.dashboard);
                      } else {
                        navigate(PATH_AUTH.register);
                      }
                    } else if (feature.link === "Tìm hiểu") {
                      if (isAuthenticated && accessToken) {
                        navigate(PATH_USER.dashboard);
                      } else {
                        // Scroll to call-to-action section
                        const ctaElement = document.getElementById(
                          "call-to-action-section"
                        );
                        if (ctaElement) {
                          ctaElement.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    } else if (feature.link === "Bắt đầu") {
                      if (isAuthenticated && accessToken) {
                        navigate(PATH_USER.dashboard);
                      } else {
                        navigate(PATH_AUTH.register);
                      }
                    }
                  }}
                >
                  {feature.link} →
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
