import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import { Facebook, Instagram, LinkedIn, YouTube } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { PATH_AUTH, PATH_USER, PATH_PUBLIC } from "../../../routes/paths";
import TascoLogo from "../../../assets/Tasco.png";

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        color: "#2C2C2C",
        py: 8,
        borderTop: "1px solid #E0E0E0",
        mt: 0, // Remove any margin
      }}
    >
      <Container maxWidth="xl">
        {/* Newsletter Section */}
        <Box sx={{ mb: 6 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
              alignItems: "center",
            }}
          >
            <Box>
              <Box
                component="img"
                src={TascoLogo}
                alt="TASCO Logo"
                sx={{
                  height: 40,
                  mb: 1,
                }}
              />
              <Typography variant="body1" sx={{ mb: 2, color: "#666666" }}>
                Đăng ký nhận bản tin để cập nhật các tính năng và phát hành mới.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Box>
                <Box sx={{ display: "flex", gap: 2, maxWidth: 400 }}>
                  <TextField
                    placeholder="Nhập email của bạn"
                    variant="outlined"
                    size="small"
                    sx={{
                      flexGrow: 1,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#2C2C2C",
                      color: "white",
                      px: 3,
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "#1A1A1A",
                      },
                    }}
                  >
                    Đăng ký
                  </Button>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
                    color: "#666666",
                    textAlign: { xs: "left", md: "right" },
                  }}
                >
                  Bằng cách đăng ký, bạn đồng ý với{" "}
                  <Link
                    href="#"
                    color="inherit"
                    sx={{ textDecoration: "underline" }}
                  >
                    Chính sách Bảo mật
                  </Link>{" "}
                  của chúng tôi.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 6, bgcolor: "#E0E0E0" }} />

        {/* Footer Links */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
            },
            gap: 4,
            mb: 6,
          }}
        >
          {/* Column 1 - Sản phẩm */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Sản phẩm
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component={RouterLink}
                to={PATH_PUBLIC.homepage}
                color="inherit"
                sx={{
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                Trang chủ
              </Link>
              <Link
                component={RouterLink}
                to={PATH_USER.dashboard}
                color="inherit"
                sx={{
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                Dashboard
              </Link>
              <Link
                component={RouterLink}
                to={PATH_USER.projectExplore}
                color="inherit"
                sx={{
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                Khám phá dự án
              </Link>
              <Link
                component={RouterLink}
                to={PATH_USER.dashboard}
                color="inherit"
                sx={{
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                Dự án của tôi
              </Link>
            </Box>
          </Box>

          {/* Column 2 - Hỗ trợ */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Hỗ trợ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component={RouterLink}
                to={PATH_AUTH.login}
                color="inherit"
                sx={{
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                Đăng nhập
              </Link>
              <Link
                component={RouterLink}
                to={PATH_AUTH.register}
                color="inherit"
                sx={{
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                Đăng ký
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                Hướng dẫn sử dụng
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                Trung tâm trợ giúp
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                Liên hệ
              </Link>
            </Box>
          </Box>

          {/* Column 3 - Social Media */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Theo dõi chúng tôi
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="#"
                color="inherit"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                <Facebook fontSize="small" />
                Facebook
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                <Instagram fontSize="small" />
                Instagram
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontSize: "16px", fontWeight: "bold" }}
                >
                  X
                </Typography>
                X
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                <LinkedIn fontSize="small" />
                LinkedIn
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#666666",
                  textDecoration: "none",
                  "&:hover": { color: "#2C2C2C" },
                }}
              >
                <YouTube fontSize="small" />
                Youtube
              </Link>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 4, bgcolor: "#E0E0E0" }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#666666" }}>
            © 2025 TASCO. Tất cả quyền được bảo lưu.
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Link
              href="#"
              color="inherit"
              sx={{
                color: "#666666",
                textDecoration: "underline",
                "&:hover": { color: "#2C2C2C" },
              }}
            >
              Chính sách Bảo mật
            </Link>
            <Link
              href="#"
              color="inherit"
              sx={{
                color: "#666666",
                textDecoration: "underline",
                "&:hover": { color: "#2C2C2C" },
              }}
            >
              Điều khoản Dịch vụ
            </Link>
            <Link
              href="#"
              color="inherit"
              sx={{
                color: "#666666",
                textDecoration: "underline",
                "&:hover": { color: "#2C2C2C" },
              }}
            >
              Cài đặt Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
