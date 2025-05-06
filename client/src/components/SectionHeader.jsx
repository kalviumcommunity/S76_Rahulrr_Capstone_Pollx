import React from 'react';

const SectionHeader = ({ tagline, title, description }) => {
  return (
    <div className="text-center mb-16">
      <span className="text-[#FF2D2D] font-medium">{tagline}</span>
      <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-white">{title}</h2>
      {description && <p className="text-gray-300 max-w-2xl mx-auto">{description}</p>}
    </div>
  );
};

export default SectionHeader;
