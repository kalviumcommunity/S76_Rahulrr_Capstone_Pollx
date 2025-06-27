import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CreatePoll from '../components/CreatePoll';

const CreatePollPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#2B2B2B]">
      <Navbar />
      <CreatePoll />
      <Footer />
    </div>
  );
};

export default CreatePollPage;
