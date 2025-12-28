import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { isAuth, user, loading } = useAuth();

  if (loading) return null; 
  if (!isAuth) return <Navigate to="/login" replace />;

  
  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}