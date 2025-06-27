import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnsweredPollCard from '../components/AnsweredPollCard';
import { getCurrentUser, logout, getVotedPolls } from '../api/auth';
import { FaSpinner, FaPoll } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answeredPolls, setAnsweredPolls] = useState([]);
  const [votedPollsLoading, setVotedPollsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage initially for quick rendering
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Then validate with server
        const userData = await getCurrentUser();
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchVotedPolls = async () => {
      try {
        setVotedPollsLoading(true);
        const response = await getVotedPolls();
        const polls = response.polls || response || [];
        setAnsweredPolls(polls);
      } catch (err) {
        console.error('Error fetching voted polls:', err);
        // Don't show error for voted polls, just set empty array
        setAnsweredPolls([]);
      } finally {
        setVotedPollsLoading(false);
      }
    };

    // Only fetch voted polls if user is loaded
    if (user) {
      fetchVotedPolls();
    }
  }, [user]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout on client side even if server request fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };
  
  const handleCreatePoll = () => {
    navigate('/create-poll');
  };

  const handleViewMyPolls = () => {
    navigate('/my-polls');
  };

  const handleViewAllPolls = () => {
    navigate('/polls');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null; // or a loading spinner
  
  return (
    <div className="min-h-screen flex flex-col bg-[#2B2B2B]">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Welcome, {user.username}!</h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-[#FF2D2D] text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl text-white mb-4">Your Dashboard</h2>
            <p className="text-gray-300">
              This is your personal dashboard where you can create and manage your polls.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 border border-gray-700 rounded-lg hover:border-[#FF2D2D] transition-colors">
              <h3 className="text-lg font-medium text-white mb-2">Create New Poll</h3>
              <p className="text-gray-400 mb-4">Start a new poll and share it with your audience.</p>
              <button 
                onClick={handleCreatePoll}
                className="px-4 py-2 bg-[#FF2D2D] text-white rounded hover:bg-red-700 transition-colors"
              >
                Create Poll
              </button>
            </div>
            
            <div className="p-4 border border-gray-700 rounded-lg hover:border-[#FF2D2D] transition-colors">
              <h3 className="text-lg font-medium text-white mb-2">Your Polls</h3>
              <p className="text-gray-400 mb-4">View and manage polls you've created.</p>
              <button 
                onClick={handleViewMyPolls}
                className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                View My Polls
              </button>
            </div>

            <div className="p-4 border border-gray-700 rounded-lg hover:border-[#FF2D2D] transition-colors">
              <h3 className="text-lg font-medium text-white mb-2">Community Polls</h3>
              <p className="text-gray-400 mb-4">Browse and participate in community polls.</p>
              <button 
                onClick={handleViewAllPolls}
                className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Browse Polls
              </button>
            </div>
          </div>
        </div>

        {/* Answered Polls Section */}
        <div className="mt-8 bg-black p-6 rounded-lg shadow-lg border border-gray-800">
          <div className="flex items-center mb-6">
            <FaPoll className="text-[#FF2D2D] text-2xl mr-3" />
            <h2 className="text-xl font-bold text-white">Polls You Participated In</h2>
          </div>
          
          {votedPollsLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="text-3xl text-[#FF2D2D] animate-spin mr-3" />
              <span className="text-gray-300">Loading your participated polls...</span>
            </div>
          ) : answeredPolls.length === 0 ? (
            <div className="text-center py-12">
              <FaPoll className="text-5xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Polls Answered Yet</h3>
              <p className="text-gray-400 mb-6">
                Start voting on community polls to see them here!
              </p>
              <button
                onClick={handleViewAllPolls}
                className="px-6 py-3 bg-[#FF2D2D] text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Browse Community Polls
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-4">
                You have participated in {answeredPolls.length} poll{answeredPolls.length !== 1 ? 's' : ''}
              </div>
              
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {answeredPolls.map((poll, index) => (
                  <AnsweredPollCard key={poll._id || index} poll={poll} />
                ))}
              </div>
              
              {answeredPolls.length > 3 && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleViewAllPolls}
                    className="text-[#FF2D2D] hover:text-red-400 text-sm font-medium"
                  >
                    View all polls →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;