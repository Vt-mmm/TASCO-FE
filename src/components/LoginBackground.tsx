import React from "react";
import { Box } from "@mui/material";

const LoginBackground: React.FC = () => {
  return (
    <>
      {/* Decorative shapes */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #E8DDD0 0%, #D4C4B0 100%)",
          opacity: 0.6,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "70%",
          right: "8%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #D4C4B0 0%, #E8DDD0 100%)",
          opacity: 0.5,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "40%",
          left: "-2%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(44, 44, 44, 0.05) 0%, rgba(44, 44, 44, 0.1) 100%)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "-3%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(232, 221, 208, 0.3) 0%, rgba(212, 196, 176, 0.5) 100%)",
          zIndex: 0,
        }}
      />
      
      {/* Subtle grid pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(rgba(44, 44, 44, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(44, 44, 44, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          zIndex: 0,
        }}
      />
    </>
  );
};

export default LoginBackground;
