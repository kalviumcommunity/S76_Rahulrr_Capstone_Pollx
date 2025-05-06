import React from 'react';
import { motion } from 'framer-motion';

const CategoryCard = ({ name, count, isPrimary = false }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={`${
        isPrimary ? 'bg-gradient-to-br from-[#FF2D2D] to-red-700' : 'bg-gradient-to-br from-[#2B2B2B] to-black border border-gray-700'
      } rounded-lg overflow-hidden shadow-lg`}
    >
      <div className="p-6 text-center">
        <h3 className="text-xl font-bold mb-2 text-white">{name}</h3>
        <p className="text-sm opacity-80 text-white">{count} active polls</p>
      </div>
    </motion.div>
  );
};

const CategoriesSection = () => {
  const categories = [
    { name: "Technology", count: "1,247", isPrimary: true },
    { name: "Politics", count: "953" },
    { name: "Entertainment", count: "825" },
    { name: "Sports", count: "712" },
    { name: "Food & Dining", count: "689" },
    { name: "Fashion", count: "583" },
    { name: "Travel", count: "521" },
    { name: "Science", count: "478" }
  ];

  return (
    <section id="categories" className="py-20 px-6 md:px-12 bg-[#2B2B2B]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#FF2D2D] font-medium">CATEGORIES</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-white">Popular Poll Categories</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Explore polls across various topics and find what interests you the most.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index}
              name={category.name}
              count={category.count}
              isPrimary={category.isPrimary}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-[#FF2D2D] text-white rounded-md font-medium hover:bg-red-700 transition shadow-lg">
            Explore All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
