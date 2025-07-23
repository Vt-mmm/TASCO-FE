import React from "react";
import { Typography, Paper, alpha } from "@mui/material";
import { useAppSelector } from "../../../redux/configStore";

const AdminWelcome = () => {
  const { userAuth } = useAppSelector((state) => state.auth);

  return (
    <Paper
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 4,
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(
            theme.palette.primary.light,
            0.2
          )} 0%, ${alpha(theme.palette.success.light, 0.2)} 100%)`,
        border: "none",
        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
        Welcome back, {userAuth?.username || "Admin"}!
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
        Here's what's happening in your dashboard today.
      </Typography>
    </Paper>
  );
};

export default AdminWelcome;
