import React, { createContext, useState, useEffect, useContext } from 'react';
import { isAuthenticated, logout, getCurrentUser } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check authentication status when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = isAuthenticated();
      setIsLoggedIn(authStatus);
      
      if (authStatus) {
        try {
          // Get user data from local storage first for quick UI update
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
          
          // Then try to get fresh user data from server
          const userData = await getCurrentUser();
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error fetching current user:', error);
          
          // If there's an error getting the user, we consider them logged out
          await logout();
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setIsLoggedIn(false);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };
  
  // Function to update auth context after login/signup
  const updateAuthStatus = (user) => {
    if (!user) {
      console.error('Attempted to update auth status with null user');
      return false;
    }
    
    // Compare with current user to avoid unnecessary updates
    const currentUserJson = JSON.stringify(currentUser);
    const newUserJson = JSON.stringify(user);
    
    // Only update if the user data is different or not logged in
    if (!isLoggedIn || currentUserJson !== newUserJson) {
      console.log('Updating auth status with user:', user);
      setCurrentUser(user);
      setIsLoggedIn(true);
      return true;
    }
    
    // Already logged in with same user data
    console.log('User already logged in, skipping update');
    return true;
  };
  
  const value = {
    currentUser,
    loading,
    isLoggedIn,
    logout: handleLogout,
    updateAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
