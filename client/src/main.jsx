import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import SmoothScroll from "./components/ui/SmoothScroll.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";

import { AuthProvider } from "./context/AuthProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { WorkspaceProvider } from "./context/WorkspaceProvider.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <SmoothScroll />
          <ScrollToTop />
          <App />
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);