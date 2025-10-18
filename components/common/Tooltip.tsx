import React, { useState, useRef, useId, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => setIsOpen(true);
  const hideTooltip = () => setIsOpen(false);

  // Toggles on click for mobile/touch devices
  const toggleTooltip = () => {
    setIsOpen(prev => !prev);
  };
  
  // Close tooltip if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        hideTooltip();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); // Re-run effect only when isOpen changes

  return (
    <div ref={containerRef} className="relative flex items-center">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={toggleTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={isOpen ? tooltipId : undefined}
        className="flex items-center"
      >
        {children}
      </div>
      {isOpen && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs
                     bg-gray-900 text-white text-xs rounded-lg py-2 px-3
                     z-10 animate-fade-in-fast"
        >
          {content}
          {/* Tooltip Arrow */}
          <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
            <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
