import React from "react";
import { Box } from "@mui/material";
import {
  Header,
  HeroSection,
  FeaturesSection,
  CallToActionSection,
  Footer,
  ScrollToTop,
} from "../../sections";

export default function HomePage() {
  // HomePage always shows the landing page content
  // The Header component will handle displaying the appropriate menu based on auth status
  return (
    <Box
      sx={{
        border: "none !important",
        outline: "none !important",
        boxShadow: "none !important",
        margin: 0,
        padding: 0,
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "transparent",
        // Force remove any possible borders
        "*": {
          border: "none !important",
          outline: "none !important",
        },
      }}
    >
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CallToActionSection />
      <Footer />
      <ScrollToTop />
    </Box>
  );
}
