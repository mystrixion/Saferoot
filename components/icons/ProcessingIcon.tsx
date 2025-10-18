import React from 'react';

const ProcessingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M12 20v-4" />
        <path d="M12 4V8" />
        <path d="M4.93 4.93 7.76 7.76" />
        <path d="M16.24 16.24 19.07 19.07" />
        <path d="M4 12H8" />
        <path d="M16 12H20" />
        <path d="M4.93 19.07 7.76 16.24" />
        <path d="M16.24 7.76 19.07 4.93" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

export default ProcessingIcon;
