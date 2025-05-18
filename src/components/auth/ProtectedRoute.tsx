
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  
  // If auth is still loading, show nothing
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // If authenticated, render children
  return <>{children}</>;
}
