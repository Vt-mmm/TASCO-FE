import { Suspense } from "react";
import type { ElementType, SuspenseProps } from "react";

// components
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";

// ----------------------------------------------------------------------

const Loadable = (Component: ElementType) => (props: SuspenseProps) => {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <Component {...props} />
    </Suspense>
  );
};
export default Loadable;
