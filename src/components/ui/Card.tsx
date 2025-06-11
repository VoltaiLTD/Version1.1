import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false,
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-card p-4';
  const hoverClasses = hoverable ? 'transition-all duration-300 hover:shadow-card-hover cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;