import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css";
import "./assets/desktop.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
);
