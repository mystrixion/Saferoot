import React from 'react';

const FactoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M2 22h20" />
    <path d="M20 12v10" />
    <path d="M15 12v10" />
    <path d="M10 12v10" />
    <path d="M5 12v10" />
    <path d="M17.5 12l-3-6" />
    <path d="M12.5 12l-3-6" />
    <path d="M7.5 12l-3-6" />
    <path d="M20 6h-3" />
    <path d="M15 6h-3" />
    <path d="M10 6H7" />
  </svg>
);

export default FactoryIcon;
