import React from 'react';
import Navbar from '../components/Navbar';
import CreatePoll from '../components/CreatePoll';

const CreatePollPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#2B2B2B]">
      <Navbar />
      <CreatePoll />
    </div>
  );
};

export default CreatePollPage;
