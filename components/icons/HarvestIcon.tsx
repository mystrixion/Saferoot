import React from 'react';

const HarvestIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M22 9L12 2 2 9" />
    <path d="M12 22V9" />
    <path d="M17 12H7" />
    <path d="M17 17H7" />
  </svg>
);

export default HarvestIcon;