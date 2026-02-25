import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./routes";
import { AuthProvider } from "./auth/authContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Router />
  </AuthProvider>
);

