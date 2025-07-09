import React from "react";
import { Box, Card, Stack } from "@mui/material";

export const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {[...Array(3)].map((_, idx) => (
        <Card
          key={idx}
          sx={{ width: { xs: "100%", sm: "48%", md: "32%" }, p: 2 }}
        >
          <Stack spacing={2}>
            <Box
              sx={{
                width: "60%",
                height: 20,
                bgcolor: "grey.300",
                borderRadius: 1,
              }}
            />
            <Box
              sx={{
                width: "100%",
                height: 60,
                bgcolor: "grey.200",
                borderRadius: 1,
              }}
            />
            <Box
              sx={{
                width: "40%",
                height: 14,
                bgcolor: "grey.300",
                borderRadius: 1,
              }}
            />
          </Stack>
        </Card>
      ))}
    </Box>
  );
};
