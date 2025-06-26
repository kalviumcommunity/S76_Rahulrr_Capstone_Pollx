import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleAuthSuccess } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Processing...');
  const { updateAuthStatus } = useAuth();
  
  // Use a ref to track if authentication has been processed
  const authProcessed = useRef(false);
  
  // Set a flag in sessionStorage to prevent processing on remounts
  const authInProgress = sessionStorage.getItem('auth_in_progress');

  useEffect(() => {
    // Skip processing if already done or in progress
    if (authProcessed.current || authInProgress === 'true') {
      return;
    }
    
    // Set the flags to prevent reprocessing
    authProcessed.current = true;
    sessionStorage.setItem('auth_in_progress', 'true');
    
    // Clear any lingering timeout flags
    localStorage.removeItem('google_auth_initiated');
    
    const processAuth = async () => {
      try {
        setStatus('Verifying authentication...');
        console.log('Processing authentication response with query params:', location.search);
        
        const result = handleAuthSuccess(location.search);
        
        if (!result) {
          console.error('Authentication failed. No valid token received.');
          console.log('Full URL:', window.location.href);
          console.log('Search params:', location.search);
          setError('Authentication failed. No valid token received.');
          setStatus('Authentication failed');
          
          setTimeout(() => {
            sessionStorage.removeItem('auth_in_progress');
            navigate('/login', { replace: true });
          }, 1500);
          
          return;
        }
        
        console.log('Auth successful, updating context');
        setStatus('Authentication successful!');
        
        // Update auth context with user data
        updateAuthStatus(result.user);
        
        // Wait a short moment to show success message, then redirect
        setTimeout(() => {
          sessionStorage.removeItem('auth_in_progress');
          navigate('/dashboard', { replace: true });
        }, 1000);
      } catch (err) {
        console.error('Auth processing error:', err);
        setError(`Authentication error: ${err.message || 'Unknown error'}`);
        setStatus('Authentication failed');
        
        setTimeout(() => {
          sessionStorage.removeItem('auth_in_progress');
          navigate('/login', { replace: true });
        }, 1500);
      }
    };
    
    processAuth();
    
    // Cleanup function to clear the flag if component unmounts before navigation
    return () => {
      if (status.includes('failed')) {
        sessionStorage.removeItem('auth_in_progress');
      }
    };
  }, []); // Removed dependencies to prevent re-runs

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-black rounded-lg shadow-lg border border-gray-800">
        <h1 className="text-2xl font-bold text-center text-white">{status}</h1>
        
        {!error ? (
          <>
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF2D2D]"></div>
            </div>
            <p className="text-gray-300 text-center">Please wait while we complete your authentication...</p>
          </>
        ) : (
          <div className="bg-red-900/30 border border-red-800 text-white px-4 py-4 rounded">
            <p className="text-center">{error}</p>
            <p className="text-center text-sm mt-2">Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSuccessPage;
