// src/auth/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const { token, isHydrated } = useAuth();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isHydrated && !token) {
      toast.error("Please login!", {
        toastId: "unauthorized-access",
      });
      setShowToast(true);
    }
  }, [token, isHydrated, showToast]);

  if (!isHydrated) return null; // wait until Zustand finishes loading localStorage

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
