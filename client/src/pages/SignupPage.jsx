import React, { useEffect } from 'react';
import SignupForm from '../components/SignupForm';

const SignupPage = () => {
  useEffect(() => {
    document.title = 'Sign Up | PollX';
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2B2B2B] to-black px-4 py-12">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
