import type { JSX } from "react";
import { useAuth } from "../../hooks/auth";
import SpinnerPage from "../../utils/spinner-page";
import { Navigate, Outlet, useLocation } from "react-router";

export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <SpinnerPage />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
