import React from 'react';

export const PremiumIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 12c-2-2.5-4-4-6.5-4C3 8 2 10 2 12s1 4 3.5 4c2.5 0 4.5-1.5 6.5-4 2-2.5 4-4 6.5-4C21 8 22 10 22 12s-1 4-3.5 4c-2.5 0-4.5-1.5-6.5-4z"/>
    </svg>
  );
};
