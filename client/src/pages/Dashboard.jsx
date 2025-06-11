import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PollCreationForm from '../components/PollCreationForm';
import { getCurrentUser, logout } from '../api/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPollForm, setShowPollForm] = useState(false);
  
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
    setShowPollForm(true);
  };

  const handleClosePollForm = () => {
    setShowPollForm(false);
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
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-4 border border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">Create New Poll</h3>
              <p className="text-gray-400 mb-4">Start a new poll and share it with your audience.</p>
              <button 
                onClick={handleCreatePoll}
                className="px-4 py-2 bg-[#FF2D2D] text-white rounded hover:bg-red-700"
              >
                Create Poll
              </button>
            </div>
            
            <div className="p-4 border border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">Your Polls</h3>
              <p className="text-gray-400 mb-4">View and manage polls you've created.</p>
              <button className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-gray-700">
                View All
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Poll Creation Form Modal */}
      {showPollForm && (
        <PollCreationForm onClose={handleClosePollForm} />
      )}
    </div>
  );
};

export default Dashboard;