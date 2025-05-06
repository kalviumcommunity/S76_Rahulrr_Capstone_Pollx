import React from 'react';
import { motion } from 'framer-motion';
import { FaCommentDots, FaShare } from 'react-icons/fa'; 
const HeroSection = () => {
  return (
    <section className="pt-20 pb-32 px-6 md:px-12 bg-gradient-to-b from-black to-[#2B2B2B]">
      <div className="container mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-white"
          >
            Create & Share <span className="text-[#FF2D2D]">Polls</span> on Any Topic
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-8 text-gray-300"
          >
            PollX is a modern social polling platform where your opinions matter. Create, vote, and discuss polls on topics that interest you.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <button className="px-8 py-3 bg-[#FF2D2D] text-white rounded-md font-medium hover:bg-red-700 transition shadow-lg">
              Create Your First Poll
            </button>
            <button className="px-8 py-3 border border-white rounded-md font-medium text-white hover:bg-white hover:text-[#2B2B2B] transition">
              Explore Polls
            </button>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="md:w-1/2"
        >
          <div className="relative">
            <div className="bg-[#2B2B2B] border border-gray-700 rounded-lg p-6 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-white">Which tech trend will dominate 2025?</h3>
                <div className="space-y-3">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1 text-white">
                      <span>Artificial Intelligence</span>
                      <span>48%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div className="bg-[#FF2D2D] h-4 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1 text-white">
                      <span>Web3 & Blockchain</span>
                      <span>27%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div className="bg-[#FF2D2D] h-4 rounded-full" style={{ width: '27%' }}></div>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1 text-white">
                      <span>AR/VR Technology</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div className="bg-[#FF2D2D] h-4 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1 text-white">
                      <span>Quantum Computing</span>
                      <span>10%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div className="bg-[#FF2D2D] h-4 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div>1,247 votes</div>
                <div className="flex space-x-4">
                  <button className="hover:text-[#FF2D2D]"><FaCommentDots /></button>
                  <button className="hover:text-[#FF2D2D]"><FaShare /></button>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -left-4 bg-[#2B2B2B] border border-gray-700 rounded-lg p-4 shadow-2xl transform -rotate-6 z-[-1]"></div>
            <div className="absolute -bottom-4 -right-4 bg-[#2B2B2B] border border-gray-700 rounded-lg p-4 shadow-2xl transform rotate-6 z-[-1]"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
