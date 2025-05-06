import React from 'react';
import { FaCommentDots, FaShare } from 'react-icons/fa';

const PollCard = ({ question, options, votes, comments }) => {
  return (
    <div className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-6 shadow-xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-white">{question}</h3>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="relative pt-1">
              <div className="flex items-center justify-between mb-1 text-white">
                <span>{option.text}</span>
                <span>{option.percentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div className="bg-[#FF2D2D] h-4 rounded-full" style={{ width: `${option.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <div>{votes} votes</div>
        <div className="flex space-x-4">
          <button className="hover:text-[#FF2D2D]">
            <FaCommentDots />
          </button>
          <button className="hover:text-[#FF2D2D]">
            <FaShare />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
