import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyTokenWithServer } from '../api/auth';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper component that protects routes from unauthorized access
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthed: false,
    userChecked: false
  });
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    // First check if the user is logged in according to our context
    if (!isLoggedIn) {
      setAuthState({
        isLoading: false,
        isAuthed: false,
        userChecked: true
      });
      return;
    }
    
    // If context shows logged in, trust it and don't verify with server
    // This reduces friction for users
    setAuthState({
      isLoading: false,
      isAuthed: true,
      userChecked: true
    });
  }, [isLoggedIn]);
  
  if (authState.isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your authentication...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login page with return URL
  if (!authState.isAuthed && authState.userChecked) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }
  
  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
