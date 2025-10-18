import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'w-full font-bold py-3 px-4 rounded-xl transition-all duration-150 ease-in-out transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900';

  const variantStyles = {
    primary: 'bg-green-700 text-white hover:bg-green-800 dark:bg-white dark:text-green-900 dark:hover:bg-gray-200 focus:ring-green-500',
    secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'bg-transparent border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-green-900 focus:ring-green-500 dark:focus:ring-white',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
