import React from 'react';

const CTASection = () => {
  return (
    <section className="py-20 px-6 md:px-12 bg-gradient-to-r from-[#FF2D2D] to-red-700 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Start Your Polling Journey?</h2>
        <p className="text-xl mb-10 max-w-2xl mx-auto">Join thousands of users who are already creating engaging polls and gathering valuable insights.</p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button className="px-8 py-4 bg-white text-[#FF2D2D] font-bold rounded-md hover:bg-gray-100 transition shadow-lg">
            Create Your Free Account
          </button>
          <button className="px-8 py-4 border-2 border-white rounded-md font-bold hover:bg-white hover:text-[#FF2D2D] transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
