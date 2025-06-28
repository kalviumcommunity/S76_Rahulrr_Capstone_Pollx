import React, { useState } from 'react';
import { deletePoll } from '../api/auth';
import { useToast } from '../context/ToastContext';

const AdminTools = () => {
  const [pollId, setPollId] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleDeletePoll = async (e) => {
    e.preventDefault();
    if (!pollId.trim()) {
      showToast('Please enter a poll ID', 'error');
      return;
    }

    try {
      setLoading(true);
      await deletePoll(pollId.trim());
      showToast('Poll deleted successfully!', 'success');
      setPollId('');
    } catch (error) {
      console.error('Error deleting poll:', error);
      showToast(error.error || 'Failed to delete poll', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">🔧 Admin Tools</h3>
      <p className="text-gray-400 text-sm mb-4">
        Test real-time poll deletion. This will instantly update all connected clients.
      </p>
      
      <form onSubmit={handleDeletePoll} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Poll ID to Delete
          </label>
          <input
            type="text"
            value={pollId}
            onChange={(e) => setPollId(e.target.value)}
            placeholder="Enter poll ID..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FF2D2D] focus:ring-1 focus:ring-[#FF2D2D]"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !pollId.trim()}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Deleting...' : 'Delete Poll'}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg">
        <p className="text-yellow-300 text-xs">
          ⚠️ This is for testing real-time updates. You can only delete polls you created.
        </p>
      </div>
    </div>
  );
};

export default AdminTools;
