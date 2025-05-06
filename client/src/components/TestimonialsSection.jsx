import React from 'react';
import { motion } from 'framer-motion';

const TestimonialCard = ({ name, role, text }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-[#2B2B2B] p-8 rounded-lg border border-gray-800"
    >
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-600 mr-4"></div>
        <div>
          <h4 className="font-bold text-white">{name}</h4>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
      </div>
      <p className="text-gray-300">{text}</p>
      <div className="flex text-[#FF2D2D] mt-4">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Marketing Manager",
      text: "\"PollX has revolutionized how we gather customer feedback. The real-time results and beautiful visualizations make it easy to share insights across our organization.\""
    },
    {
      name: "Sarah Williams",
      role: "Content Creator",
      text: "\"As a content creator, I use PollX to engage with my audience and understand their preferences. It's incredibly easy to use and the social sharing features help my polls reach a wider audience.\""
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      text: "\"PollX provides valuable insights that help drive our product decisions. The platform's ease of use and robust analytics make it an essential part of our user research toolkit.\""
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-6 md:px-12 bg-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#FF2D2D] font-medium">TESTIMONIALS</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-white">What Our Users Say</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Join thousands of satisfied users who are leveraging PollX to gather insights and make better decisions.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              text={testimonial.text}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
