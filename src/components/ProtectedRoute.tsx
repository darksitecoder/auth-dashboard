import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const checkApproval = async () => {
      if (isAuthenticated && user) {
        // Check if user is approved
        if (user.isApproved) {
          setIsApproved(true);
        } else {
          // User is not approved, redirect to login with error
          setIsApproved(false);
        }
      }
      setIsLoading(false);
    };

    checkApproval();
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isApproved) {
    // User is authenticated but not approved, redirect to login with error
    return <Navigate to="/login" state={{ 
      from: location, 
      error: 'Your account is pending admin approval. Please wait for approval before accessing the dashboard.' 
    }} replace />;
  }

  return <>{children}</>;
};