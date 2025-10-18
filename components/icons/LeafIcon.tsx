import React from 'react';

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M17 8c-4.5-1-5-8-11-8" />
    <path d="M17 8c0 5-4.5 9-11 9" />
  </svg>
);

export default LeafIcon;
