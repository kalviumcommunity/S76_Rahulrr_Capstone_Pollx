import React from 'react';
import { motion } from 'framer-motion';
import { FaVoteYea, FaChartBar, FaCommentDots, FaShare, FaUser, FaPoll } from 'react-icons/fa';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div 
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="bg-black p-8 rounded-lg border border-gray-800"
    >
      <div className="bg-[#FF2D2D] w-14 h-14 rounded-full flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <FaVoteYea className="text-2xl" />,
      title: "Easy Poll Creation",
      description: "Create customized polls in seconds with multiple question types and options."
    },
    {
      icon: <FaChartBar className="text-2xl" />,
      title: "Real-time Results",
      description: "See voting results update instantly with beautiful, interactive visualizations."
    },
    {
      icon: <FaCommentDots className="text-2xl" />,
      title: "Community Engagement",
      description: "Comment on polls and engage in discussions with other community members."
    },
    {
      icon: <FaShare className="text-2xl" />,
      title: "Social Sharing",
      description: "Share your polls across all major social media platforms with a single click."
    },
    {
      icon: <FaUser className="text-2xl" />,
      title: "User Profiles",
      description: "Track your polling history and build a reputation within the community."
    },
    {
      icon: <FaPoll className="text-2xl" />,
      title: "Categorized Browsing",
      description: "Browse polls by categories and discover what's trending in your areas of interest."
    }
  ];

  return (
    <section id="features" className="py-20 px-6 md:px-12 bg-[#2B2B2B]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#FF2D2D] font-medium">FEATURES</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-white">Why Choose PollX?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Our platform offers everything you need to create engaging polls and get meaningful insights from your audience.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
