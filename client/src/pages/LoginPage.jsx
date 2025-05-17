import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const successMessage = location.state?.message;
  const [error, setError] = useState(null);
  
  useEffect(() => {
    document.title = 'Login | PollX';
    
    // Check for error parameters in URL
    const errorParam = searchParams.get('error');
    const sessionParam = searchParams.get('session');
    
    if (errorParam === 'google_auth_failed') {
      setError('Google authentication failed. Please try again.');
    } else if (sessionParam === 'expired') {
      setError('Your session has expired. Please login again.');
    }
  }, [searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2B2B2B] to-black px-4 py-12">
      <div className="w-full max-w-md">
        {successMessage && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-700 text-white rounded-lg text-center">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-700 text-white rounded-lg text-center">
            {error}
          </div>
        )}
        
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
