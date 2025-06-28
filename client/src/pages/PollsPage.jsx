import React from 'react';
import Navbar from '../components/Navbar';
import PollFeed from '../components/PollFeed';

const PollsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#2B2B2B]">
      <Navbar />
      <PollFeed />
    </div>
  );
};

export default PollsPage;
