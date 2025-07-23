import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
  useTheme,
  CircularProgress,
} from "@mui/material";

interface AnalyticsWidgetProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  loading?: boolean;
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  title,
  value,
  icon,
  color = "primary",
  loading = false,
}) => {
  const theme = useTheme();

  const iconColor = theme.palette[color].main;
  const bgColor = alpha(iconColor, 0.1);

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 28px ${alpha(iconColor, 0.15)}`,
        },
      }}
    >
      <CardContent>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 100,
            }}
          >
            <CircularProgress size={30} sx={{ color: iconColor }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 0.5,
                }}
              >
                {value}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                {title}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: bgColor,
                color: iconColor,
                "& .MuiSvgIcon-root": {
                  fontSize: 32,
                },
              }}
            >
              {icon}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsWidget;
