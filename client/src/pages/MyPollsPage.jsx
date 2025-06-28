import React from 'react';
import Navbar from '../components/Navbar';
import MyPolls from '../components/MyPolls';

const MyPollsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#2B2B2B]">
      <Navbar />
      <MyPolls />
    </div>
  );
};

export default MyPollsPage;
