import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  Avatar,
} from "@mui/material";
import { Menu as MenuIcon, AccountCircle, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PATH_AUTH, PATH_USER } from "../../../routes/paths";
import { useAppSelector, useAppDispatch } from "../../../redux/configStore";
import { logoutThunk } from "../../../redux/auth/authThunks";
import { getAccessToken } from "../../../utils";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, userAuth } = useAppSelector((state) => state.auth);
  const accessToken = getAccessToken();

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      navigate(PATH_AUTH.login);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    handleCloseUserMenu();
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: "white", color: "text.primary" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h5"
            noWrap
            component="div"
            onClick={() => {
              // Navigate based on authentication status
              if (isAuthenticated && accessToken) {
                navigate(PATH_USER.homepage);
              } else {
                navigate("/");
              }
            }}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              color: "#2C2C2C",
              fontStyle: "italic",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            Logo
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleCloseNavMenu();
                  // Navigate based on authentication status
                  if (isAuthenticated && accessToken) {
                    navigate(PATH_USER.homepage);
                  } else {
                    navigate("/");
                  }
                }}
              >
                <Typography textAlign="center">Trang chủ</Typography>
              </MenuItem>
              {isAuthenticated &&
                accessToken && [
                  <MenuItem
                    key="dashboard"
                    onClick={() => {
                      handleCloseNavMenu();
                      navigate(PATH_USER.dashboard);
                    }}
                  >
                    <Typography textAlign="center">My Projects</Typography>
                  </MenuItem>,
                  <MenuItem
                    key="explore"
                    onClick={() => {
                      handleCloseNavMenu();
                      navigate(PATH_USER.projectExplore);
                    }}
                  >
                    <Typography textAlign="center">Khám Phá Dự Án</Typography>
                  </MenuItem>,
                ]}
              {!isAuthenticated && [
                <MenuItem key="features" onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">Tính năng</Typography>
                </MenuItem>,
                <MenuItem key="contact" onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">Liên hệ</Typography>
                </MenuItem>,
              ]}
            </Menu>
          </Box>

          {/* Mobile logo */}
          <Typography
            variant="h5"
            noWrap
            component="div"
            onClick={() => {
              // Navigate based on authentication status
              if (isAuthenticated && accessToken) {
                navigate(PATH_USER.homepage);
              } else {
                navigate("/");
              }
            }}
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontWeight: 700,
              color: "#2C2C2C",
              fontStyle: "italic",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            Logo
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, ml: 4 }}>
            <Button
              sx={{ my: 2, color: "text.primary", display: "block" }}
              onClick={() => {
                // Navigate based on authentication status
                if (isAuthenticated && accessToken) {
                  navigate(PATH_USER.homepage);
                } else {
                  navigate("/");
                }
              }}
            >
              Trang chủ
            </Button>
            {isAuthenticated &&
              accessToken && [
                <Button
                  key="dashboard"
                  sx={{ my: 2, color: "text.primary", display: "block" }}
                  onClick={() => navigate(PATH_USER.dashboard)}
                >
                  My Projects
                </Button>,
                <Button
                  key="explore"
                  sx={{ my: 2, color: "text.primary", display: "block" }}
                  onClick={() => navigate(PATH_USER.projectExplore)}
                >
                  Khám Phá Dự Án
                </Button>,
              ]}
            {!isAuthenticated && [
              <Button
                key="services"
                sx={{ my: 2, color: "text.primary", display: "block" }}
              >
                Dịch Vụ
              </Button>,
              <Button
                key="about"
                sx={{ my: 2, color: "text.primary", display: "block" }}
              >
                Giới Thiệu
              </Button>,
              <Button
                key="resources"
                sx={{ my: 2, color: "text.primary", display: "block" }}
              >
                Tài Nguyên
              </Button>,
            ]}
          </Box>

          {/* Right side menu */}
          <Box
            sx={{ flexGrow: 0, display: "flex", gap: 1, alignItems: "center" }}
          >
            {isAuthenticated && accessToken
              ? [
                  // Notification bell for authenticated users
                  // User menu for authenticated users
                  <IconButton
                    key="user-avatar"
                    onClick={handleOpenUserMenu}
                    sx={{ p: 0 }}
                  >
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <AccountCircle />
                    </Avatar>
                  </IconButton>,
                  <Menu
                    key="user-menu"
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem onClick={handleCloseUserMenu}>
                      <Typography textAlign="center">
                        {userAuth?.username || userAuth?.email}
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Logout sx={{ mr: 1 }} />
                      <Typography textAlign="center">Đăng xuất</Typography>
                    </MenuItem>
                  </Menu>,
                ]
              : [
                  // Auth buttons for non-authenticated users
                  <Button
                    key="login"
                    variant="outlined"
                    onClick={() => navigate(PATH_AUTH.login)}
                    sx={{
                      borderColor: "#2C2C2C",
                      color: "#2C2C2C",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#2C2C2C",
                        bgcolor: "rgba(44, 44, 44, 0.04)",
                      },
                    }}
                  >
                    Tham Gia
                  </Button>,
                  <Button
                    key="register"
                    variant="contained"
                    onClick={() => navigate(PATH_AUTH.register)}
                    sx={{
                      bgcolor: "#2C2C2C",
                      color: "white",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#1A1A1A",
                      },
                    }}
                  >
                    Đăng Ký
                  </Button>,
                ]}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
