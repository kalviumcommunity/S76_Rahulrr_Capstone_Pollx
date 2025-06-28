import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';

const DeleteButton = ({ onDelete, item, confirmationMessage = "Are you sure you want to delete this item?" }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(item);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center px-3 py-2 text-xs font-medium text-red-400 border border-red-400/30 rounded-md hover:bg-red-400/10 hover:border-red-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete Poll"
    >
      <FaTrash className="mr-1.5 text-xs" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </motion.button>
  );
};

export default DeleteButton;
