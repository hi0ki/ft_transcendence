import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./routes";
import { AuthProvider } from "./auth/authContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Router />
  </AuthProvider>
);
