import React from 'react';
import { FaGithub, FaHeart } from 'react-icons/fa';

const MinimalFooter = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-6 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-400 text-sm">
          <div className="flex items-center space-x-2">
            <span>Built with</span>
            <FaHeart className="text-red-500 text-xs animate-pulse" />
            <span>by</span>
            <a 
              href="https://github.com/rahulrr-coder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#FF2D2D] hover:text-red-400 transition-colors font-medium flex items-center space-x-1"
            >
              <FaGithub className="text-sm" />
              <span>@rahulrr-coder</span>
            </a>
          </div>
          <span className="hidden sm:inline text-gray-600">•</span>
          <span>© {new Date().getFullYear()} PollX</span>
        </div>
      </div>
    </footer>
  );
};

export default MinimalFooter;
