import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPoll, FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

// Create API instance with the same configuration as auth.js
const API_URL = import.meta.env.PROD 
  ? 'https://s76-rahulrr-capstone-pollx.onrender.com'
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Add request interceptor to include token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const CreatePoll = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '']
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionChange = (e) => {
    setFormData({
      ...formData,
      question: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const addOption = () => {
    if (formData.options.length < 4) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.question.trim()) {
      setError('Please enter a question');
      return;
    }

    const validOptions = formData.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    if (validOptions.length > 4) {
      setError('Maximum 4 options allowed');
      return;
    }

    // Check for authentication (simple check)
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to create a poll');
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      const pollData = {
        question: formData.question.trim(),
        options: validOptions.map(option => option.trim())
      };
      
      // Use the configured API instance instead of fetch
      const response = await api.post('/polls', pollData);

      // Success
      setSuccess('Poll created successfully!');
      setFormData({
        question: '',
        options: ['', '']
      });
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Error creating poll:', error);
      
      if (error.response?.status === 401) {
        // Let the response interceptor in auth.js handle this
        setError('Session expired. Please log in again.');
      } else {
        setError(error.response?.data?.error || error.message || 'Failed to create poll. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#2B2B2B] rounded-lg p-8 border border-gray-700 shadow-xl">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <FaPoll className="text-[#FF2D2D] text-2xl" />
            <h1 className="text-2xl font-bold text-white">Create New Poll</h1>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded mb-6 flex items-center space-x-2">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Input */}
            <div>
              <label htmlFor="question" className="block text-gray-300 text-sm font-medium mb-2">
                Poll Question *
              </label>
              <textarea
                id="question"
                placeholder="What would you like to ask your audience?"
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#FF2D2D] focus:ring-1 focus:ring-[#FF2D2D] transition-colors resize-none"
                rows="3"
                value={formData.question}
                onChange={handleQuestionChange}
                disabled={isLoading}
                required
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Poll Options * (2-4 options)
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm text-gray-300">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#FF2D2D] focus:ring-1 focus:ring-[#FF2D2D] transition-colors"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      disabled={isLoading}
                      required={index < 2}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors p-2"
                        disabled={isLoading}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Add Option Button */}
              {formData.options.length < 4 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-4 flex items-center space-x-2 text-[#FF2D2D] hover:text-red-400 transition-colors"
                  disabled={isLoading}
                >
                  <FaPlus className="text-sm" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#FF2D2D] text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Poll</span>
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Tips for creating great polls:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Keep your question clear and concise</li>
              <li>• Provide balanced and distinct options</li>
              <li>• Avoid bias in your question or options</li>
              <li>• Make sure all options are mutually exclusive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;
