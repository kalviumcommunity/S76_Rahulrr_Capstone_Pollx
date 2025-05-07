import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const location = useLocation();
  const successMessage = location.state?.message;
  
  useEffect(() => {
    document.title = 'Login | PollX';
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2B2B2B] to-black px-4 py-12">
      <div className="w-full max-w-md">
        {successMessage && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-700 text-white rounded-lg text-center">
            {successMessage}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
