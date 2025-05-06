import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  onClick 
}) => {
  const baseClasses = "rounded-md font-medium transition shadow-lg";
  
  const variantClasses = {
    primary: "bg-[#FF2D2D] text-white hover:bg-red-700",
    secondary: "border border-white text-white hover:bg-white hover:text-[#2B2B2B]",
    white: "bg-white text-[#FF2D2D] hover:bg-gray-100"
  };
  
  const sizeClasses = {
    small: "px-4 py-2",
    medium: "px-6 py-3",
    large: "px-8 py-4"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
