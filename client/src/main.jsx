
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import SmoothScroll from "./components/ui/SmoothScroll.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { WorkspaceProvider } from "./context/WorkspaceContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <WorkspaceProvider>
        <SmoothScroll />
        <ScrollToTop />
        <App />
      </WorkspaceProvider>
    </AuthProvider>
  </BrowserRouter>,
);
