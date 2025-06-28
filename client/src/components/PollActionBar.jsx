import React from 'react';
import { motion } from 'framer-motion';
import ShareButton from './ShareButton';
import DeleteButton from './DeleteButton';

const PollActionBar = ({ poll, showActions, onDelete }) => {
  if (!showActions) return null;

  return (
    <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-600">
      {/* Share Button - Always visible for polls */}
      <ShareButton 
        pollId={poll._id}
        pollQuestion={poll.question}
      />
      
      {/* Delete Button - Only for poll owners */}
      {onDelete && (
        <DeleteButton 
          onDelete={onDelete}
          item={poll}
          confirmationMessage="Are you sure you want to delete this poll? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default PollActionBar;
