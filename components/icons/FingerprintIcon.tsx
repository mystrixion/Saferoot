import React from 'react';

const FingerprintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M22 12h-2" />
    <path d="M4 12H2" />
    <path d="M18 18c-2-2-5-3-7-3s-5 1-7 3" />
    <path d="M6 6c2 2 5 3 7 3s5-1 7-3" />
  </svg>
);

export default FingerprintIcon;