import React from 'react';

const StepCard = ({ number, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#FF2D2D] text-white flex items-center justify-center text-2xl font-bold mb-6">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      title: "Create Your Poll",
      description: "Choose a topic, add your question and customize options for your audience to vote on."
    },
    {
      number: 2,
      title: "Share With Your Audience",
      description: "Distribute your poll through social media, email, or directly on the PollX platform."
    },
    {
      number: 3,
      title: "Analyze Results",
      description: "Watch votes come in real-time and gain insights through our detailed analytics."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 md:px-12 bg-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-white">How PollX Works</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Creating and sharing polls has never been easier. Follow these simple steps to get started.</p>
        </div>
        
        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          {/* Horizontal line for desktop */}
          {/*<div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-[#FF2D2D] transform -translate-y-1/2 z-0"></div>*/}
          
          {/* Step Cards */}
          {steps.map((step, index) => (
            <div key={index} className="relative z-10">
              <StepCard 
                number={step.number} 
                title={step.title} 
                description={step.description} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
