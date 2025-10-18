
import React from 'react';

// FIX: Add className to props to allow for custom positioning and styling.
const Spinner: React.FC<{ size?: string; className?: string }> = ({ size = 'h-5 w-5', className = '' }) => {
  return (
    <div
      // FIX: Apply the passed className to the div element.
      className={`${size} animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

export default Spinner;