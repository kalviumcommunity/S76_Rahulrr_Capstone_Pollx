import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPoll } from 'react-icons/fa';
import Button from './Button';
import GoogleLoginButton from './GoogleLoginButton';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const SignupForm = () => {
  const navigate = useNavigate();
  const { updateAuthStatus } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use the register function from auth API
      const { username, email, password } = formData;
      const result = await register({ username, email, password });
      
      // Update authentication context with the user data
      updateAuthStatus(result.user);
      
      // Registration successful, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || err.error || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // No need for handleGoogleSignup as we'll use the GoogleLoginButton component

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-black rounded-lg shadow-lg border border-gray-800">
      <div className="flex justify-center mb-8">
        <Link to="/" className="flex items-center space-x-2">
          <FaPoll className="text-[#FF2D2D] text-3xl" />
          <span className="text-3xl font-bold text-white">Poll<span className="text-[#FF2D2D]">X</span></span>
        </Link>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Your Account</h2>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-white px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Google Sign-up Button */}
      <GoogleLoginButton isSignUp={true} />
      
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-700"></div>
        <span className="px-3 text-sm text-gray-400">or</span>
        <div className="flex-grow border-t border-gray-700"></div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-300 mb-2">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className="w-full px-4 py-2 bg-[#2B2B2B] text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF2D2D]"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-2 bg-[#2B2B2B] text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF2D2D]"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-4 py-2 bg-[#2B2B2B] text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF2D2D]"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="w-full px-4 py-2 bg-[#2B2B2B] text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF2D2D]"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <Button
          variant="primary"
          size="medium"
          fullWidth={true}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-[#FF2D2D] hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
