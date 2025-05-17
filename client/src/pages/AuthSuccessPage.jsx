import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleAuthSuccess } from '../api/auth';

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const result = handleAuthSuccess(location.search);
      if (result) {
        // Auth was successful, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500); // Short delay to show success message
      } else {
        // Auth failed, redirect to login
        setError('Authentication failed. No valid token received.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Auth processing error:', err);
      setError('An error occurred processing your authentication.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Authenticating...</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccessPage;
