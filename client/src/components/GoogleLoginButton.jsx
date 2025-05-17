import React, { useState } from 'react';
import { googleLogin } from '../api/auth';

const GoogleLoginButton = ({ isSignUp = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    googleLogin();
    // Note: No need to reset loading state as we're navigating away
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`flex items-center justify-center w-full px-4 py-2 mb-4 text-white rounded-md 
        ${isLoading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50'}`}
      type="button"
    >
      {isLoading ? (
        <span className="mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
        </svg>
      )}
      {isLoading 
        ? (isSignUp ? 'Connecting...' : 'Signing in...') 
        : (isSignUp ? 'Sign up with Google' : 'Continue with Google')}
    </button>
  );
};

export default GoogleLoginButton;
