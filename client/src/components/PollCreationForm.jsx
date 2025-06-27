import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPoll, FaPlus, FaTimes } from 'react-icons/fa';
import Button from './Button';

const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000' 
  : 'https://s76-rahulrr-capstone-pollx.onrender.com';

const PollCreationForm = ({ onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '']
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionChange = (e) => {
    setFormData({
      ...formData,
      question: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
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

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to create a poll');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      const pollData = {
        question: formData.question.trim(),
        options: validOptions.map(option => option.trim())
      };
      
      const response = await fetch(`${API_URL}/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pollData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        throw new Error(result.error || 'Failed to create poll');
      }

      // Success - show success message and close form
      setFormData({ question: '', options: ['', ''] });
      if (onClose) onClose();
      
      // You could add a toast notification here for success
      alert('Poll created successfully!');
      
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#2B2B2B] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <FaPoll className="text-[#FF2D2D] text-xl" />
            <h2 className="text-xl font-bold text-white">Create New Poll</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="question" className="block text-gray-300 mb-2">
              Poll Question
            </label>
            <textarea
              id="question"
              placeholder="What would you like to ask?"
              className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF2D2D] resize-none"
              rows="3"
              value={formData.question}
              onChange={handleQuestionChange}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3">Poll Options</label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-[#FF2D2D]"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required={index < 2}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {formData.options.length < 4 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 flex items-center space-x-2 text-[#FF2D2D] hover:text-red-400 transition"
              >
                <FaPlus className="text-sm" />
                <span>Add Option</span>
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              size="medium"
              fullWidth={true}
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="medium"
              fullWidth={true}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PollCreationForm;