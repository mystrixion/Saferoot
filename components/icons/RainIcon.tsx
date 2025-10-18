import React from 'react';

const RainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 17a5 5 0 0 0-5-5h-1.26a8 8 0 0 0-15.48 0H5a5 5 0 0 0 0 10h12" />
    <path d="M8 21v-2" />
    <path d="M12 21v-2" />
    <path d="M16 21v-2" />
  </svg>
);

export default RainIcon;