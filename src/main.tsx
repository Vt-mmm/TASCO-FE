import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { tasco } from "./redux/configStore";
import setupAxiosClient from "./axiosClient/setupClientInterceptors";

// Setup axios interceptors with Redux store
setupAxiosClient(tasco);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
