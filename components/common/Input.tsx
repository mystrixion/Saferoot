import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  isInvalid?: boolean;
}

const Input: React.FC<InputProps> = ({ icon, className, isInvalid, ...props }) => {
  const baseStyles = 'w-full py-3 pr-3 text-gray-900 dark:text-white bg-white/70 dark:bg-green-900/50 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-700 dark:placeholder-gray-400';
  const normalStyles = 'border border-green-400 dark:border-green-600 focus:ring-green-400';
  const invalidStyles = 'border-2 border-red-500 dark:border-red-500 focus:ring-red-500';
  
  return (
    <div className="relative w-full">
      {icon && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700 dark:text-gray-400">{icon}</span>}
      <input
        className={`${baseStyles} ${icon ? 'pl-10' : 'pl-4'} ${isInvalid ? invalidStyles : normalStyles} ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
