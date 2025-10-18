import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ icon, children, className, ...props }) => {
  const baseStyles = 'w-full appearance-none py-3 pr-10 text-gray-900 dark:text-white bg-white/70 dark:bg-green-900/50 border border-green-400 dark:border-green-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400';

  return (
    <div className="relative w-full">
      {icon && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700 dark:text-gray-400">{icon}</span>}
      <select
        className={`${baseStyles} ${icon ? 'pl-10' : 'pl-4'} ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};

export default Select;